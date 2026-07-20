import { NextResponse } from "next/server";
import { can, getCurrentUserContext } from "../../../../../lib/data/context";
import { validateDarajaConnection } from "../../../../../lib/reconciliation/daraja";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getCurrentUserContext();
  if (!context) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!can(context, "manage_finance")) {
    return NextResponse.json({ error: "Finance permission and required MFA are needed." }, { status: 403 });
  }

  try {
    const result = await validateDarajaConnection();
    return NextResponse.json(result, {
      status: result.connected ? 200 : result.configured ? 502 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "Daraja did not respond before the connection check timed out."
      : "Daraja could not be reached from the server.";
    return NextResponse.json({
      connected: false,
      configured: true,
      environment: process.env.MPESA_DARAJA_ENV === "production" ? "production" : "sandbox",
      expiresInSeconds: null,
      checkedAt: new Date().toISOString(),
      message,
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
