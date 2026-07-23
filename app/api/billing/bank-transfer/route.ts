import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { assertSameOrigin, BillingError, requireBillingManager } from "../../../../lib/billing/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxReceiptSize = 10 * 1024 * 1024;

function errorResponse(error: unknown) {
  if (error instanceof BillingError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error("Bank-transfer submission failed", error);
  return NextResponse.json({ error: "Unable to submit the bank-transfer proof.", code: "bank_transfer_submission_failed" }, { status: 500 });
}

function cleanReference(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 120) : "";
}

function safeExtension(file: File) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  let uploadedPath: string | null = null;
  try {
    assertSameOrigin(request);
    const user = await requireBillingManager();
    const form = await request.formData();
    const orderId = cleanReference(form.get("orderId"));
    const channelSlug = cleanReference(form.get("channel"));
    const transferReference = cleanReference(form.get("transferReference"));
    const amount = Number(cleanReference(form.get("amount")));
    const receipt = form.get("receipt");

    if (!/^[0-9a-f-]{36}$/i.test(orderId)) throw new BillingError("A valid billing order is required.", 400, "invalid_order");
    if (!/^[a-z0-9-]{2,80}$/.test(channelSlug)) throw new BillingError("Choose a valid bank-transfer channel.", 400, "invalid_bank_channel");
    if (transferReference.length < 3) throw new BillingError("Enter the bank transaction reference.", 400, "transfer_reference_required");
    if (!Number.isFinite(amount) || amount <= 0) throw new BillingError("Enter the transferred amount.", 400, "invalid_transfer_amount");
    if (!(receipt instanceof File) || receipt.size === 0) throw new BillingError("Attach a receipt image or PDF.", 400, "receipt_required");
    if (receipt.size > maxReceiptSize) throw new BillingError("The receipt must be 10 MB or smaller.", 400, "receipt_too_large");
    if (!acceptedTypes.has(receipt.type)) throw new BillingError("Upload a JPG, PNG, WebP or PDF receipt.", 400, "unsupported_receipt_type");

    const admin = createAdminClient();
    const [{ data: order, error: orderError }, { data: channel, error: channelError }] = await Promise.all([
      admin.from("billing_payment_orders")
        .select("id,organization_id,provider,status,total_amount,currency,tx_ref")
        .eq("id", orderId)
        .eq("organization_id", user.organizationId)
        .eq("provider", "bank_transfer")
        .maybeSingle(),
      admin.from("billing_payment_channels")
        .select("slug,kind,is_enabled,currency")
        .eq("slug", channelSlug)
        .eq("kind", "bank_transfer")
        .eq("is_enabled", true)
        .maybeSingle(),
    ]);

    if (orderError || !order) throw new BillingError("The bank-transfer order was not found.", 404, "bank_order_not_found");
    if (channelError || !channel) throw new BillingError("The selected bank channel is unavailable.", 400, "bank_channel_unavailable");
    if (["paid", "refunded", "reversed", "cancelled", "expired"].includes(String(order.status))) {
      throw new BillingError("This order no longer accepts transfer proof.", 409, "order_not_payable");
    }
    if (Math.abs(Number(order.total_amount) - amount) > 0.01) {
      throw new BillingError(`The submitted amount must match ${order.currency} ${Number(order.total_amount).toFixed(2)}.`, 400, "transfer_amount_mismatch");
    }

    const receiptBytes = Buffer.from(await receipt.arrayBuffer());
    uploadedPath = `${user.organizationId}/${order.id}/${Date.now()}-${randomUUID()}.${safeExtension(receipt)}`;
    const { error: uploadError } = await admin.storage.from("billing-receipts").upload(uploadedPath, receiptBytes, {
      contentType: receipt.type,
      upsert: false,
    });
    if (uploadError) throw new BillingError("The receipt could not be stored securely.", 500, "receipt_upload_failed");

    const { data: submission, error: submissionError } = await admin.from("billing_bank_transfer_submissions").insert({
      organization_id: user.organizationId,
      payment_order_id: order.id,
      channel_slug: channel.slug,
      transfer_reference: transferReference,
      amount,
      receipt_path: uploadedPath,
      status: "pending",
      submitted_by: user.userId,
    }).select("id,status,created_at").single();

    if (submissionError || !submission) {
      if (uploadedPath) await admin.storage.from("billing-receipts").remove([uploadedPath]);
      if (submissionError?.code === "23505") throw new BillingError("This transfer reference was already submitted.", 409, "duplicate_transfer_reference");
      throw new BillingError("Unable to record the transfer proof.", 500, "transfer_record_failed");
    }

    const { error: updateError } = await admin.from("billing_payment_orders").update({
      status: "pending_review",
      payment_method: channel.slug,
      provider_reference: transferReference,
    }).eq("id", order.id);
    if (updateError) throw new BillingError("The transfer was submitted, but the order state could not be updated.", 500, "order_state_update_failed");

    return NextResponse.json({
      submitted: true,
      submissionId: submission.id,
      status: submission.status,
      txRef: order.tx_ref,
      message: "Transfer proof received. HisabTech finance will verify it before activating the subscription.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
