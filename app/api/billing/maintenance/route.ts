import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("billing_refresh_subscription_statuses");
    if (error) throw error;
    return NextResponse.json({ ok: true, result: data, executedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Billing lifecycle maintenance failed", error);
    return NextResponse.json({ ok: false, error: "Billing lifecycle maintenance failed." }, { status: 500 });
  }
}
