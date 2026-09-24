import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useStaff } from "@/components/admin/StaffContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, hasRole, logAudit, supabase } from "@/lib/supabase";

type Inquiry = {
  id: string; full_name: string; email: string; subject: string; message: string;
  status: string; staff_notes: string; created_at: string;
};
const statuses = ["new", "in_progress", "resolved", "spam"];
export const Route = createFileRoute("/admin/inbox")({
  head: () => ({ meta: [{ title: "Inquiry Inbox | TECH-UP" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Inbox,
});

function Inbox() {
  const { role } = useStaff();
  const canManage = hasRole(role, "admin");
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftStatus, setDraftStatus] = useState("new");
  const [saving, setSaving] = useState(false);
  const q = useQuery({
    queryKey: ["admin", "inbox"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_inquiries")
        .select("id,full_name,email,subject,message,status,staff_notes,created_at")
        .order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });
  const records = (q.data ?? []).filter((r) =>
    (filter === "all" || r.status === filter) &&
    `${r.full_name} ${r.email} ${r.subject} ${r.message}`.toLowerCase().includes(search.toLowerCase()),
  );
  const active = q.data?.find((r) => r.id === selected);
  function choose(r: Inquiry) { setSelected(r.id); setDraftNotes(r.staff_notes); setDraftStatus(r.status); }
  async function save() {
    if (!active || !canManage) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("contact_inquiries")
        .update({ status: draftStatus, staff_notes: draftNotes, updated_at: new Date().toISOString() })
        .eq("id", active.id);
      if (error) throw error;
      await logAudit("update", "contact_inquiries", active.id);
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Inquiry updated");
    } catch (e) { toast.error(errorMessage(e)); } finally { setSaving(false); }
  }
  return <section>
    <h1 className="text-2xl font-bold text-primary">Inquiry inbox</h1>
    <p className="mt-1 text-sm text-muted-foreground">Messages submitted through the TECH-UP website. Only authorised staff can read these records.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <Input className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inquiries" aria-label="Search inquiries" />
      <select aria-label="Filter inquiry status" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
      </select>
    </div>
    {q.isLoading && <p className="mt-5" role="status">Loading inquiries…</p>}
    {q.isError && <p className="mt-5 text-destructive" role="alert">{errorMessage(q.error)} <Button variant="outline" onClick={() => void q.refetch()}>Retry</Button></p>}
    {q.isSuccess && <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,1.5fr)]">
      <div className="max-h-[650px] space-y-2 overflow-y-auto" aria-label="Inquiries">
        {records.length === 0 && <p className="rounded-xl border p-5 text-sm text-muted-foreground">No matching inquiries.</p>}
        {records.map((r) => <button type="button" key={r.id} onClick={() => choose(r)} className={`w-full rounded-xl border p-4 text-left hover:border-primary ${selected === r.id ? "border-primary bg-secondary" : "border-border bg-card"}`}>
          <span className="flex justify-between gap-2 text-sm font-semibold"><span className="truncate">{r.full_name}</span><span className="shrink-0 text-xs font-normal text-muted-foreground">{r.status.replace("_", " ")}</span></span>
          <span className="mt-1 block truncate text-sm">{r.subject}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-ZA")}</span>
        </button>)}
      </div>
      <div className="min-w-0 rounded-xl border border-border bg-card p-5">
        {!active ? <p className="text-sm text-muted-foreground">Select a message to review it.</p> : <div className="space-y-5">
          <div><h2 className="text-xl font-semibold">{active.subject}</h2><p className="mt-1 text-sm text-muted-foreground">{active.full_name} · <a className="underline" href={`mailto:${active.email}`}>{active.email}</a></p><p className="mt-1 text-xs text-muted-foreground">{new Date(active.created_at).toLocaleString("en-ZA")}</p></div>
          <p className="whitespace-pre-wrap break-words rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed">{active.message}</p>
          <div className="space-y-2"><label htmlFor="inquiry-status" className="block text-sm font-semibold">Status</label><select id="inquiry-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draftStatus} disabled={!canManage} onChange={(e) => setDraftStatus(e.target.value)}>{statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
          <div className="space-y-2"><label htmlFor="inquiry-notes" className="block text-sm font-semibold">Internal notes</label><Textarea id="inquiry-notes" value={draftNotes} rows={5} disabled={!canManage} maxLength={10000} onChange={(e) => setDraftNotes(e.target.value)} /></div>
          {canManage && <Button onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save inquiry"}</Button>}
          {!canManage && <p className="text-xs text-muted-foreground">Your role has read-only access to inquiries.</p>}
        </div>}
      </div>
    </div>}
  </section>;
}
