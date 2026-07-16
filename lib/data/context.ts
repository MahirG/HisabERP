import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../config";
import { createClient } from "../supabase/server";
import type { UserContext } from "./types";

export async function getCurrentUserContext(options: { required?: boolean } = {}): Promise<UserContext | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) {
    if (options.required) redirect("/auth/login");
    return null;
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id,branch_id,role,full_name,organizations(name)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (options.required) redirect("/onboarding");
    return null;
  }

  const organization = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
  return {
    userId,
    email: String(claimsData.claims.email ?? ""),
    fullName: String(data.full_name || claimsData.claims.email || "User"),
    organizationId: String(data.organization_id),
    organizationName: String((organization as { name?: string } | null)?.name || "Organization"),
    branchId: data.branch_id ? String(data.branch_id) : null,
    role: data.role as UserContext["role"],
  };
}

export function can(context: UserContext, permission: "manage_finance" | "manage_sales" | "manage_inventory" | "manage_users") {
  const matrix: Record<UserContext["role"], string[]> = {
    owner: ["manage_finance", "manage_sales", "manage_inventory", "manage_users"],
    admin: ["manage_finance", "manage_sales", "manage_inventory", "manage_users"],
    accountant: ["manage_finance", "manage_sales"],
    sales: ["manage_sales"],
    inventory: ["manage_inventory"],
    viewer: [],
  };
  return matrix[context.role].includes(permission);
}
