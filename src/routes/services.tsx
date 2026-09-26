import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, ClipboardList, Loader2, LogOut, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase, errorMessage } from "@/lib/supabase";

export const Route = createFileRoute("/services")({
  ssr: false,
  head: () => ({ meta: [{ title: "My services | TECH-UP" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ServicesDashboard,
});
export const SERVICES = [
  { id: "tertiary_admissions", title: "Tertiary admission guidance", description: "Get help with course choices, application pathways and admission requirements." },
  { id: "digital_training", title: "Digital skills training", description: "Enquire about computer literacy, programming and workplace digital skills." },
  { id: "printing_scanning", title: "Printing and scanning", description: "Request printing, scanning or document preparation services." },
  { id: "graphic_design", title: "Graphic design", description: "Request design support for posters, business material or digital communications." },
  { id: "digital_admin", title: "Digital administration", description: "Ask for digital forms, document processing or general digital administration." },
  { id: "it_support", title: "IT and hardware support", description: "Request help for a school, small business or community member." },
  { id: "other", title: "Other enquiry", description: "Describe another service you would like to discuss with TECH-UP." },
] as const;
type ServiceId = (typeof SERVICES)[number]["id"];
type ServiceRequest = { id: string; service_type: ServiceId; subject: string; description: string; contact_phone: string | null; status: string; staff_response: string; created_at: string; updated_at: string };
function ServicesDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [service, setService] = useState<ServiceId>("tertiary_admissions");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user); setChecking(false);
      if (!data.user) void navigate({ to: "/services/sign-in", replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "SIGNED_OUT") { setUser(null); setRequests([]); void navigate({ to: "/services/sign-in", replace: true }); }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        // Supabase advises keeping auth callbacks synchronous to avoid auth-client deadlocks.
        Promise.resolve().then(() => supabase.auth.getUser()).then(({ data }) => { if (active) { setUser(data.user); setChecking(false); } });
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [navigate]);
  const load = useCallback(async (userId: string) => {
    setLoading(true); setError("");
    const { data, error: queryError } = await supabase.from("service_requests")
      .select("id,service_type,subject,description,contact_phone,status,staff_response,created_at,updated_at")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
    if (queryError) setError(errorMessage(queryError));
    else setRequests((data ?? []) as ServiceRequest[]);
    setLoading(false);
  }, []);
  useEffect(() => { if (user) void load(user.id); }, [user, load]);
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`service-requests-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests", filter: `user_id=eq.${user.id}` }, () => void load(user.id))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, load]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;
    setError(""); setNotice("");
    if (subject.trim().length < 3 || description.trim().length < 10) { setError("Enter a subject and a description of at least 10 characters."); return; }
    if (phone.trim() && (phone.trim().length < 7 || phone.trim().length > 25)) { setError("Enter a valid phone number or leave it blank."); return; }
    setSaving(true);
    const { error: insertError } = await supabase.from("service_requests").insert({
      user_id: user.id, service_type: service, subject: subject.trim(), description: description.trim(),
      contact_phone: phone.trim() || null,
    });
    if (insertError) setError(errorMessage(insertError));
    else { setNotice("Your service request was submitted. You can track its status below."); setSubject(""); setDescription(""); setPhone(""); setShowForm(false); await load(user.id); }
    setSaving(false);
  }
  async function signOut() { await supabase.auth.signOut(); setUser(null); setRequests([]); void navigate({ to: "/services/sign-in", replace: true }); }
  if (checking || !user) return <main className="flex min-h-dvh items-center justify-center" role="status"><Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" /><span className="sr-only">Checking your account…</span></main>;
  return <main className="min-h-dvh bg-surface"><header className="border-b border-border bg-background"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6"><Link to="/" className="flex items-center gap-2 font-bold text-primary"><img src="/favicon.png" alt="" width={40} height={40} className="size-10 object-contain" />TECH-UP Services</Link><div className="flex items-center gap-2"><span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:inline">{user.email}</span><Button variant="outline" size="sm" onClick={() => void signOut()}><LogOut className="size-4" aria-hidden="true" />Sign out</Button></div></div></header>
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link to="/" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><ArrowLeft className="size-3" /> Website</Link><h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">My TECH-UP services</h1><p className="mt-2 text-sm text-muted-foreground">Request a service and follow its progress from your secure account.</p></div><Button onClick={() => { setShowForm((current) => !current); setError(""); }}><PlusCircle className="size-4" aria-hidden="true" />{showForm ? "Close form" : "New request"}</Button></div>
    {notice && <p role="status" className="rounded-xl border border-primary/20 bg-background p-4 text-sm text-primary">{notice}</p>}
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-background p-4 text-sm text-destructive">{error}</p>}
    {showForm && <section className="rounded-2xl border bg-card p-5 sm:p-8"><h2 className="text-xl font-bold text-primary">Request a service</h2><p className="mt-2 text-sm text-muted-foreground">Describe your needs. Do not include ID numbers, banking details, passwords or sensitive documents. A request is not an official tertiary application, booking or payment.</p><form onSubmit={(event) => void submit(event)} className="mt-6 grid gap-5 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="request-service">Service</Label><select id="request-service" value={service} onChange={(e) => setService(e.target.value as ServiceId)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">{SERVICES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><p className="text-xs text-muted-foreground">{SERVICES.find((item) => item.id === service)?.description}</p></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="request-subject">Subject</Label><Input id="request-subject" required minLength={3} maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="request-description">Describe your request</Label><Textarea id="request-description" required rows={5} minLength={10} maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="request-phone">Contact number (optional)</Label><Input id="request-phone" type="tel" minLength={7} maxLength={25} value={phone} onChange={(e) => setPhone(e.target.value)} /></div><div className="flex items-end"><Button type="submit" disabled={saving} className="w-full">{saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}Submit request</Button></div></form></section>}
    <section><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-primary">My requests</h2><p className="mt-1 text-sm text-muted-foreground">Only your own requests appear in this account.</p></div><Button variant="outline" size="sm" disabled={loading} onClick={() => void load(user.id)}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh</Button></div>
    {loading && <p role="status" className="mt-6 text-sm text-muted-foreground">Loading your requests…</p>}
    {!loading && requests.length === 0 && <div className="mt-5 rounded-2xl border border-dashed bg-background p-10 text-center"><ClipboardList className="mx-auto size-8 text-primary" aria-hidden="true" /><p className="mt-3 font-semibold">No service requests yet</p><p className="mt-1 text-sm text-muted-foreground">Use “New request” to contact TECH-UP about one of our services.</p></div>}
    <div className="mt-5 grid gap-4 md:grid-cols-2">{requests.map((request) => <article key={request.id} className="rounded-2xl border bg-card p-5"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-brand-turquoise">{SERVICES.find((item) => item.id === request.service_type)?.title ?? "Service"}</p><span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{request.status.replaceAll("_", " ")}</span></div><h3 className="mt-3 font-bold text-primary">{request.subject}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{request.description}</p>{request.staff_response && <div className="mt-4 rounded-xl border border-primary/15 bg-secondary/40 p-4"><p className="text-xs font-semibold text-primary">TECH-UP response</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{request.staff_response}</p></div>}<p className="mt-4 text-xs text-muted-foreground">Submitted {new Date(request.created_at).toLocaleDateString("en-ZA")}</p></article>)}</div>
    </section></div>
  </main>;
}
