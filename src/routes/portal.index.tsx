import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BookOpen, ClipboardList, GraduationCap, HandHelping, Radio } from "lucide-react";

import { usePortalUser } from "@/components/portal/UserContext";
import { Button } from "@/components/ui/button";
import { errorMessage, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [{ title: "Overview | My TECH-UP" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PortalOverview,
});

function PortalOverview() {
  const { user, profile } = usePortalUser();
  const qc = useQueryClient();
  useRealtimeRefresh(["applications","course_enrollments","assistance_requests","notifications","service_requests"], "portal");

  const summary = useQuery({
    queryKey: ["portal","overview",user.id],
    queryFn: async () => {
      const [apps, courses, help, notices, services] = await Promise.all([
        supabase.from("applications").select("*",{ count:"exact", head:true }).eq("user_id",user.id),
        supabase.from("course_enrollments").select("*",{ count:"exact", head:true }).eq("user_id",user.id),
        supabase.from("assistance_requests").select("*",{ count:"exact", head:true }).eq("user_id",user.id).not("status","in","(resolved,closed)"),
        supabase.from("notifications").select("id,title,body,href,read_at,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(8),
        supabase.from("service_requests").select("*",{ count:"exact", head:true }).eq("user_id",user.id).not("status","in","(completed,cancelled)"),
      ]);
      const firstError = [apps.error,courses.error,help.error,notices.error,services.error].find(Boolean);
      if (firstError) throw firstError;
      return {
        applications: apps.count ?? 0,
        courses: courses.count ?? 0,
        assistance: help.count ?? 0,
        services: services.count ?? 0,
        notices: notices.data ?? [],
      };
    },
  });

  async function markAllRead() {
    const ids = (summary.data?.notices ?? []).filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id",ids);
    await qc.invalidateQueries({ queryKey:["portal"] });
  }

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || "there";
  const unread = (summary.data?.notices ?? []).filter((n) => !n.read_at).length;

  const cards: { label: string; value: number | undefined; icon: typeof Bell; to: "/portal/applications" | "/portal/courses" | "/portal/assistance" | "/services" }[] = [
    { label: "Applications", value: summary.data?.applications, icon: ClipboardList, to: "/portal/applications" },
    { label: "Course interests", value: summary.data?.courses, icon: GraduationCap, to: "/portal/courses" },
    { label: "Open assistance", value: summary.data?.assistance, icon: HandHelping, to: "/portal/assistance" },
    { label: "Open services", value: summary.data?.services, icon: BookOpen, to: "/services" },
  ];

  return <section>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-turquoise">My TECH-UP</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-primary">Welcome, {firstName}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Manage your TECH-UP support journey from one account: applications, courses, assistance and service requests.</p></div>
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-2 text-xs font-semibold text-primary"><Radio className="size-3.5" />Live updates on</span>
    </div>

    {summary.isError && <p className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{errorMessage(summary.error)}</p>}

    <dl className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({label,value,icon:Icon,to}) => <Link key={label} to={to} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand-turquoise/40 hover:shadow-soft"><dt className="flex items-center justify-between text-sm text-muted-foreground"><span>{label}</span><Icon className="size-4 text-primary" /></dt><dd className="mt-3 text-3xl font-bold text-primary">{summary.isLoading ? "…" : String(value ?? 0)}</dd></Link>)}
    </dl>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-semibold text-primary"><Bell className="size-4" />Latest updates</p><p className="mt-1 text-xs text-muted-foreground">{unread} unread update{unread===1?"":"s"}</p></div>{unread>0 && <Button size="sm" variant="outline" onClick={() => void markAllRead()}>Mark all read</Button>}</div>
        <div className="mt-5 space-y-3">
          {(summary.data?.notices ?? []).length===0 && <p className="rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">No updates yet. New application, course and assistance activity will appear here automatically.</p>}
          {(summary.data?.notices ?? []).map((n) => <Link key={n.id} to={n.href || "/portal"} className={`block rounded-xl border p-4 ${n.read_at?"border-border bg-background":"border-brand-turquoise/30 bg-brand-turquoise/5"}`}><p className="text-sm font-semibold text-foreground">{n.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-ZA")}</p></Link>)}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary">Quick actions</p>
        <div className="mt-4 grid gap-3">
          <Link to="/portal/applications" className="rounded-xl border border-border p-4 text-sm font-semibold hover:bg-secondary">Create an application support record</Link>
          <Link to="/portal/courses" className="rounded-xl border border-border p-4 text-sm font-semibold hover:bg-secondary">Browse TECH-UP courses</Link>
          <Link to="/portal/assistance" className="rounded-xl border border-border p-4 text-sm font-semibold hover:bg-secondary">Ask TECH-UP for assistance</Link>
          <Link to="/portal/profile" className="rounded-xl border border-border p-4 text-sm font-semibold hover:bg-secondary">Complete my profile</Link>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">TECH-UP application support tracks assistance provided by TECH-UP. Official admission decisions remain with the relevant institution or programme owner.</p>
      </div>
    </div>
  </section>;
}
