import { createClient } from "@supabase/supabase-js";
import { appConfig } from "../config";

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!appConfig.supabaseUrl || !key) throw new Error("Supabase admin access is not configured.");
  return createClient(appConfig.supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
