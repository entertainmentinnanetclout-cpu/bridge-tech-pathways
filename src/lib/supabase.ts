import { createClient } from "@supabase/supabase-js";

// Public (publishable) values only — safe for the browser. Never place a service-role key here.
const env = import.meta.env as Record<string, string | undefined>;
export const SUPABASE_URL = env["VITE_SUPABASE_URL"] ?? "https://wwtxsvvnwwbjsqsdjfpn.supabase.co";
const SUPABASE_ANON_KEY =
  env["VITE_SUPABASE_ANON_KEY"] ?? "sb_publishable_6vtbL7gleAD7vQUUSGAJJw_b1Aw-306";

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: isBrowser, autoRefreshToken: isBrowser, detectSessionInUrl: isBrowser },
});

export type StaffRole = "super_admin" | "admin" | "editor" | "viewer";
export const ROLE_RANK: Record<StaffRole, number> = { viewer: 1, editor: 2, admin: 3, super_admin: 4 };
export const hasRole = (role: StaffRole | null, min: StaffRole) =>
  role !== null && ROLE_RANK[role] >= ROLE_RANK[min];

export async function logAudit(action: string, entityType: string, entityId: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  // Best effort; RLS decides whether this is permitted.
  await supabase
    .from("admin_audit_log")
    .insert({ actor: data.user.id, action, entity_type: entityType, entity_id: entityId });
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return "Something went wrong";
}
