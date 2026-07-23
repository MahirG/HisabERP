import { NextResponse } from "next/server";
import { appConfig } from "../../../../../lib/config";
import { verifyAndFinalizeChapaOrder } from "../../../../../lib/billing/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const txRef = url.searchParams.get("trx_ref") || url.searchParams.get("tx_ref") || "";
  const redirectUrl = new URL("/billing", appConfig.appUrl);
  redirectUrl.searchParams.set("payment", "callback");
  if (txRef) redirectUrl.searchParams.set("tx_ref", txRef);

  try {
    if (!txRef) throw new Error("Missing transaction reference.");
    const result = await verifyAndFinalizeChapaOrder(txRef);
    redirectUrl.searchParams.set("status", result.status);
  } catch (error) {
    console.error("Chapa callback verification failed", error);
    redirectUrl.searchParams.set("status", "verification_failed");
  }

  return NextResponse.redirect(redirectUrl, 303);
}
