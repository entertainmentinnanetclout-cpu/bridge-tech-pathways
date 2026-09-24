import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStaff } from "@/components/admin/StaffContext";
import { errorMessage, hasRole, logAudit, supabase } from "@/lib/supabase";

const ALLOWED = ["announcement", "contact_email", "contact_phone", "intake_url", "hero_heading", "hero_subheading"] as const;
const descriptions: Record<string, string> = {
  announcement: "Public announcement: enter a JSON string, e.g. \"Applications open\"; use \"\" to hide.",
  contact_email: "Public contact email as a JSON string.",
  contact_phone: "Public contact phone as a JSON string.",
  intake_url: "Public tertiary-intake URL as a JSON string beginning with https://.",
  hero_heading: "Optional public hero heading as a JSON string.",
  hero_subheading: "Optional public hero paragraph as a JSON string.",
};
export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings | TECH-UP Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Settings,
});
function Settings() {
  const { role } = useStaff();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["admin", "settings"],
    enabled: hasRole(role, "admin"),
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value").in("key", [...ALLOWED]);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, unknown>;
    },
  });
  if (!hasRole(role, "admin")) return <p role="alert">Admin access is required.</p>;
  async function save(key: string) {
    setBusy(key);
    try {
      const raw = edits[key] ?? JSON.stringify(q.data?.[key] ?? "");
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "string") throw new Error("Enter a JSON string, including the surrounding double quotes.");
      if (key === "contact_email" && parsed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed)) throw new Error("Enter a valid email address.");
      if (key === "intake_url" && parsed && !/^https:\/\//i.test(parsed)) throw new Error("Use an HTTPS intake URL.");
      if (parsed.length > 1000) throw new Error("Maximum length is 1000 characters.");
      const { error } = await supabase.from("site_settings").upsert({ key, value: parsed, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      await logAudit("update", "site_settings", key);
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      await qc.invalidateQueries({ queryKey: ["public"] });
      setEdits((old) => { const next = { ...old }; delete next[key]; return next; });
      toast.success("Setting saved");
    } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(null); }
  }
  return <section><h1 className="text-2xl font-bold text-primary">Website settings</h1><p className="mt-2 text-sm text-muted-foreground">Public configuration only. Credentials and sensitive configuration must never be stored here.</p>
    {q.isLoading && <p role="status" className="mt-6">Loading settings…</p>}
    {q.isError && <p role="alert" className="mt-6 text-destructive">{errorMessage(q.error)}</p>}
    {q.isSuccess && <div className="mt-6 grid gap-4 xl:grid-cols-2">{ALLOWED.map((key) => <div key={key} className="rounded-xl border border-border bg-card p-5">
      <label htmlFor={`setting-${key}`} className="text-sm font-semibold capitalize">{key.replaceAll("_", " ")}</label><p className="mt-1 text-xs text-muted-foreground">{descriptions[key]}</p>
      {key === "hero_subheading" ? <Textarea id={`setting-${key}`} rows={4} className="mt-3 font-mono text-sm" value={edits[key] ?? JSON.stringify(q.data[key] ?? "")} onChange={(e) => setEdits((old) => ({ ...old, [key]: e.target.value }))} /> : <Input id={`setting-${key}`} className="mt-3 font-mono text-sm" value={edits[key] ?? JSON.stringify(q.data[key] ?? "")} onChange={(e) => setEdits((old) => ({ ...old, [key]: e.target.value }))} />}
      <Button className="mt-3" size="sm" disabled={busy !== null || edits[key] === undefined} onClick={() => void save(key)}>{busy === key ? "Saving…" : "Save"}</Button>
    </div>)}</div>}
  </section>;
}
