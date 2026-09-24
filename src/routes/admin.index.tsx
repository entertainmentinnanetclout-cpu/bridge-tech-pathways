import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { errorMessage, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview | TECH-UP Admin" }, { name: "robots", content: "noindex" }] }),
  component: Overview,
});

const KPIS = [
  { label: "New inquiries", table: "contact_inquiries", col: "status", val: "new" },
  { label: "Published programmes", table: "programs", col: "status", val: "published" },
  { label: "Open opportunities", table: "opportunities", col: "status", val: "published" },
  { label: "Published events", table: "events", col: "status", val: "published" },
] as const;

function Overview() {
  const q = useQuery({
    queryKey: ["admin", "kpis"],
    queryFn: async () =>
      Promise.all(
        KPIS.map(async (k) => {
          const { count, error } = await supabase.from(k.table).select("*", { count: "exact", head: true }).eq(k.col, k.val);
          if (error) throw error;
          return count ?? 0;
        }),
      ),
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Overview</h1>
      {q.isError && <p role="alert" className="mt-4 text-sm text-destructive">{errorMessage(q.error)}</p>}
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <dt className="text-sm text-muted-foreground">{k.label}</dt>
            <dd className="mt-2 text-3xl font-bold text-primary">{q.isLoading ? "…" : (q.data?.[i] ?? "—")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
