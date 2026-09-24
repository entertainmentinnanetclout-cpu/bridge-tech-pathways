import { useEffect, useState } from "react";
import { CalendarDays, ArrowUpRight, BookOpen, BriefcaseBusiness, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Reveal } from "@/components/site/Reveal";

type Item = { id: string; title: string; summary: string; external_url: string | null; kind: "programme" | "opportunity" | "event"; detail?: string | undefined };
type Notice = { id: string; heading: string; body: string };
export function PublicUpdates() {
  const [items, setItems] = useState<Item[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let mounted = true;
    async function load() {
      const [p, o, e, n] = await Promise.all([
        supabase.from("programs").select("id,title,summary,external_url,category").eq("status", "published").order("sort_order", { ascending: true }).limit(12),
        supabase.from("opportunities").select("id,title,summary,external_url,closing_date").eq("status", "published").order("created_at", { ascending: false }).limit(12),
        supabase.from("events").select("id,title,summary,external_url,starts_at").eq("status", "published").order("starts_at", { ascending: true }).limit(12),
        supabase.from("content_sections").select("id,heading,body").eq("is_published", true).order("sort_order", { ascending: true }).limit(12),
      ]);
      if (!mounted) return;
      if ([p, o, e, n].some((r) => r.error)) { setFailed(true); setLoading(false); return; }
      setItems([
        ...(p.data ?? []).map((r) => ({ id: r.id, title: r.title, summary: r.summary, external_url: r.external_url, kind: "programme" as const, detail: r.category })),
        ...(o.data ?? []).map((r) => ({ id: r.id, title: r.title, summary: r.summary, external_url: r.external_url, kind: "opportunity" as const, detail: r.closing_date ? `Closes ${new Date(`${r.closing_date}T12:00:00`).toLocaleDateString("en-ZA")}` : undefined })),
        ...(e.data ?? []).map((r) => ({ id: r.id, title: r.title, summary: r.summary, external_url: r.external_url, kind: "event" as const, detail: r.starts_at ? new Date(r.starts_at).toLocaleDateString("en-ZA") : undefined })),
      ]);
      setNotices((n.data ?? []) as Notice[]);
      setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, []);
  if (loading || failed || (!items.length && !notices.length)) return null;
  const icons = { programme: BookOpen, opportunity: BriefcaseBusiness, event: CalendarDays };
  return <section id="updates" className="scroll-mt-24 bg-surface">
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <Reveal><p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">Latest from TECH-UP</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Programmes, events & opportunities</h2><p className="mt-4 max-w-2xl text-muted-foreground">Explore updates published by the TECH-UP team.</p></Reveal>
      {notices.length > 0 && <div className="mt-8 space-y-3">{notices.map((n) => <div key={n.id} className="rounded-xl border border-primary/15 bg-background p-5"><p className="flex items-center gap-2 font-semibold text-primary"><Megaphone className="size-4" aria-hidden="true" />{n.heading}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{n.body}</p></div>)}</div>}
      {items.length > 0 && <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => { const Icon = icons[item.kind]; const url = item.external_url && /^https:\/\//i.test(item.external_url) ? item.external_url : null;
        return <article key={`${item.kind}-${item.id}`} className="flex flex-col rounded-2xl border border-border/80 bg-card p-6"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-turquoise"><Icon className="size-4" aria-hidden="true" />{item.kind}{item.detail ? ` · ${item.detail}` : ""}</p><h3 className="mt-4 text-lg font-bold text-primary">{item.title}</h3><p className="mt-3 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{item.summary}</p>{url && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">Learn more <ArrowUpRight className="size-4" aria-hidden="true" /></a>}</article>;
      })}</div>}
    </div>
  </section>;
}
