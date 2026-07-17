import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "../config";
import { createClient } from "../supabase/server";
import type { UserContext } from "./types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? "";
}

export async function getCurrentUserContext(options: { required?: boolean } = {}): Promise<UserContext | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = asRecord(claimsData?.claims);
  const userId = firstString(claims.sub);
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
  const userMetadata = asRecord(claims.user_metadata);
  const appMetadata = asRecord(claims.app_metadata);
  const email = firstString(claims.email);

  return {
    userId,
    email,
    fullName: firstString(data.full_name, userMetadata.full_name, userMetadata.name, email, "User"),
    organizationId: String(data.organization_id),
    organizationName: String((organization as { name?: string } | null)?.name || "Organization"),
    branchId: data.branch_id ? String(data.branch_id) : null,
    role: data.role as UserContext["role"],
    avatarUrl: firstString(userMetadata.avatar_url, userMetadata.picture) || null,
    provider: firstString(appMetadata.provider) || null,
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
