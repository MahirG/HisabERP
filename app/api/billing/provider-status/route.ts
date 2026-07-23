import { NextResponse } from "next/server";
import { getPublicProviderStatus } from "../../../../lib/billing/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getPublicProviderStatus();
    return NextResponse.json(status, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch (error) {
    console.error("Unable to load billing provider status", error);
    return NextResponse.json({
      activation: "configuration_required",
      digitalCheckout: { provider: "Chapa", configured: false, webhookConfigured: false, mode: "unconfigured", supportedMethods: [] },
      bankTransfer: { enabled: false, channelCount: 0 },
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
