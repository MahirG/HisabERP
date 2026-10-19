import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getCurrentUserContext } from "../../../../lib/data/context";
import { isSupabaseConfigured } from "../../../../lib/config";

export const dynamic = "force-dynamic";

function escapeLike(value: string) {
  return value.replace(/[%,()\\]/g, "").trim().slice(0, 64);
}

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  if (!isSupabaseConfigured()) return NextResponse.json({ results: [] }, { headers });
  const user = await getCurrentUserContext({ required: true });
  if (!user?.organizationId) return NextResponse.json({ results: [] }, { status: 401, headers });
  const query = escapeLike(request.nextUrl.searchParams.get("q") ?? "");
  if (query.length < 2) return NextResponse.json({ results: [] }, { headers });
  const supabase = await createClient();
  const org = user.organizationId;
  const pattern = `%${query}%`;
  const [customers, products, journals] = await Promise.all([
    supabase.from("customers").select("id,name,email").eq("organization_id", org).ilike("name", pattern).limit(6),
    supabase.from("product_stock_view").select("product_id,name,sku").eq("organization_id", org).or(`name.ilike.${pattern},sku.ilike.${pattern}`).limit(6),
    supabase.from("journal_summary_view").select("id,entry_number,memo").eq("organization_id", org).ilike("entry_number", pattern).limit(6),
  ]);
  const results = [
    ...(customers.data ?? []).map(row => ({ label: String(row.name), description: String(row.email ?? "Customer"), group: "Customers", href: "/customers", icon: "users" })),
    ...(products.data ?? []).map(row => ({ label: String(row.name), description: String(row.sku ?? "Product"), group: "Products", href: "/inventory", icon: "boxes" })),
    ...(journals.data ?? []).map(row => ({ label: String(row.entry_number), description: String(row.memo ?? "Journal"), group: "Financial records", href: "/finance/journals", icon: "file-check" })),
  ];
  return NextResponse.json({ results }, { headers });
}
