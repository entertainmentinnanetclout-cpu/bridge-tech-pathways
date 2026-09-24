import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useStaff } from "@/components/admin/StaffContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, logAudit, supabase, type StaffRole } from "@/lib/supabase";
const ROLES: StaffRole[] = ["viewer", "editor", "admin", "super_admin"];
type Row = { user_id: string; role: StaffRole; created_at: string };
export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff | TECH-UP Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Staff,
});
function Staff() {
  const { role, user } = useStaff();
  const qc = useQueryClient();
  const [id, setId] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("viewer");
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["admin", "staff"], enabled: role === "super_admin",
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_roles").select("user_id,role,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
  if (role !== "super_admin") return <p role="alert">Super-admin access is required.</p>;
  async function grant(userId: string, nextRole: StaffRole) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) { toast.error("Enter an existing Supabase Auth user UUID."); return; }
    if (userId === user.id && nextRole !== "super_admin") { toast.error("You cannot demote your own super-admin account."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from("staff_roles").upsert({ user_id: userId, role: nextRole }, { onConflict: "user_id" });
      if (error) throw error;
      await logAudit("grant_role", "staff_roles", userId);
      setId(""); await qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      toast.success("Staff role saved");
    } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  }
  async function remove(userId: string) {
    if (userId === user.id) { toast.error("You cannot remove your own super-admin access."); return; }
    if (!window.confirm("Revoke this person's staff access?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("staff_roles").delete().eq("user_id", userId);
      if (error) throw error;
      await logAudit("revoke_role", "staff_roles", userId);
      await qc.invalidateQueries({ queryKey: ["admin", "staff"] });
      toast.success("Staff access removed");
    } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  }
  return <section><h1 className="text-2xl font-bold text-primary">Staff access</h1>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Assign access only to existing Supabase Auth users. Create or invite a user first in the Supabase Auth dashboard, then copy the user's UUID here. A role never creates a user account.</p>
    <div className="mt-6 flex flex-wrap gap-3 rounded-xl border bg-card p-5">
      <Input className="min-w-0 flex-1" placeholder="Existing Auth user UUID" aria-label="Auth user UUID" value={id} onChange={(e) => setId(e.target.value.trim())} />
      <select className="h-10 rounded-md border border-input bg-background px-3" aria-label="New staff role" value={newRole} onChange={(e) => setNewRole(e.target.value as StaffRole)}>{ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}</select>
      <Button disabled={busy || !id} onClick={() => void grant(id, newRole)}>Grant access</Button>
    </div>
    {q.isLoading && <p className="mt-6" role="status">Loading staff…</p>}
    {q.isError && <p className="mt-6 text-destructive" role="alert">{errorMessage(q.error)}</p>}
    {q.isSuccess && <div className="mt-6 overflow-hidden rounded-xl border bg-card"><ul className="divide-y divide-border">{q.data.map((r) => <li key={r.user_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0"><p className="break-all font-mono text-xs">{r.user_id}</p><p className="mt-1 text-xs text-muted-foreground">{r.user_id === user.id ? "Your account · " : ""}{new Date(r.created_at).toLocaleDateString("en-ZA")}</p></div>
      <div className="flex flex-wrap gap-2"><select aria-label={`Role for ${r.user_id}`} value={r.role} disabled={busy || r.user_id === user.id} onChange={(e) => void grant(r.user_id, e.target.value as StaffRole)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">{ROLES.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}</select><Button size="sm" variant="outline" disabled={busy || r.user_id === user.id} onClick={() => void remove(r.user_id)}>Revoke</Button></div>
    </li>)}{q.data.length === 0 && <li className="p-5 text-sm text-muted-foreground">No staff roles have been assigned.</li>}</ul></div>}
  </section>;
}
