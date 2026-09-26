import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useStaff } from "@/components/admin/StaffContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, hasRole, logAudit, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

const STATUSES = ["submitted", "in_review", "awaiting_information", "in_progress", "completed", "cancelled"];
type Request = { id: string; user_id: string; service_type: string; subject: string; description: string; contact_phone: string | null; status: string; staff_response: string; created_at: string; updated_at: string };
export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Service Requests | TECH-UP Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ServiceRequests,
});
function ServiceRequests() {
  const { role } = useStaff();
  const canManage = hasRole(role, "editor");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState("submitted");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  useRealtimeRefresh(["service_requests"], "admin");
  const q = useQuery({ queryKey: ["admin", "service_requests"], queryFn: async () => {
    const { data, error } = await supabase.from("service_requests")
      .select("id,user_id,service_type,subject,description,contact_phone,status,staff_response,created_at,updated_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return (data ?? []) as Request[];
  } });
  const records = (q.data ?? []).filter((r) => (filter === "all" || r.status === filter) &&
    `${r.subject} ${r.description} ${r.service_type} ${r.user_id}`.toLowerCase().includes(search.toLowerCase()));
  const active = q.data?.find((r) => r.id === selected);
  async function save() {
    if (!active || !canManage || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("service_requests")
        .update({ status, staff_response: response.trim() }).eq("id", active.id);
      if (error) throw error;
      await logAudit("update", "service_requests", active.id);
      await qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Service request updated. Your response is visible to the requester.");
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setSaving(false); }
  }
  return <section><h1 className="text-2xl font-bold text-primary">Service requests</h1><p className="mt-2 text-sm text-muted-foreground">Requests submitted by registered service users. Staff responses are shown in the requester's dashboard. Do not paste internal or confidential notes here.</p>
    <div className="mt-5 flex flex-wrap gap-3"><Input className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search service requests" aria-label="Search service requests"/><select aria-label="Filter service status" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select><Button variant="outline" onClick={() => void q.refetch()}>Refresh</Button></div>
    {q.isLoading && <p className="mt-5" role="status">Loading requests…</p>}
    {q.isError && <p className="mt-5 text-destructive" role="alert">{errorMessage(q.error)} <Button variant="outline" onClick={() => void q.refetch()}>Retry</Button></p>}
    {q.isSuccess && <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,1.5fr)]"><div className="max-h-[650px] space-y-2 overflow-y-auto">{records.length === 0 && <p className="rounded-xl border p-5 text-sm text-muted-foreground">No matching requests.</p>}{records.map((r) => <button type="button" key={r.id} onClick={() => { setSelected(r.id); setStatus(r.status); setResponse(r.staff_response); }} className={`w-full rounded-xl border p-4 text-left hover:border-primary ${selected === r.id ? "border-primary bg-secondary" : "border-border bg-card"}`}><span className="block text-xs font-semibold uppercase text-brand-turquoise">{r.service_type.replaceAll("_", " ")}</span><span className="mt-1 block font-semibold">{r.subject}</span><span className="mt-1 block text-xs text-muted-foreground">{r.status.replaceAll("_", " ")} · {new Date(r.created_at).toLocaleDateString("en-ZA")}</span></button>)}</div><div className="min-w-0 rounded-xl border border-border bg-card p-5">{!active ? <p className="text-sm text-muted-foreground">Select a request to review it.</p> : <div className="space-y-5"><div><h2 className="text-xl font-semibold">{active.subject}</h2><p className="mt-1 text-xs text-muted-foreground">Requester ID: {active.user_id}</p><p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(active.created_at).toLocaleString("en-ZA")}</p>{active.contact_phone && <p className="mt-1 text-sm">Contact: <a className="underline" href={`tel:${active.contact_phone}`}>{active.contact_phone}</a></p>}</div><p className="whitespace-pre-wrap break-words rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed">{active.description}</p><div className="space-y-2"><label htmlFor="service-admin-status" className="block text-sm font-semibold">Status</label><select id="service-admin-status" value={status} disabled={!canManage} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></div><div className="space-y-2"><label htmlFor="service-admin-response" className="block text-sm font-semibold">Response visible to requester</label><Textarea id="service-admin-response" rows={5} maxLength={3000} disabled={!canManage} value={response} onChange={(e) => setResponse(e.target.value)} /></div>{canManage ? <Button disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save status and response"}</Button> : <p className="text-xs text-muted-foreground">Your staff role is read-only.</p>}</div>}</div></div>}
  </section>;
}
