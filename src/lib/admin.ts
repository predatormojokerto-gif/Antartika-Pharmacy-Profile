import { supabase } from "@/integrations/supabase/client";

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function claimAdminIfNone(_userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("claim_first_admin");
  if (error) {
    console.error("claim_first_admin error:", error);
    return false;
  }
  return data === true;
}
