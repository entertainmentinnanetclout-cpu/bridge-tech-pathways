import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bell, BookOpen, ClipboardList, GraduationCap, HandHelping, Home, Loader2, LogOut, Menu, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { UserContext, type UserProfile } from "@/components/portal/UserContext";
import { BrandLogo } from "@/components/site/BrandLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/portal")({
  ssr: false,
  head: () => ({ meta: [{ title: "My TECH-UP" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PortalLayout,
});

const NAV = [
  { to: "/portal", label: "Overview", icon: Home },
  { to: "/portal/applications", label: "Applications", icon: ClipboardList },
  { to: "/portal/courses", label: "Courses", icon: GraduationCap },
  { to: "/portal/assistance", label: "Assistance", icon: HandHelping },
  { to: "/portal/profile", label: "My profile", icon: UserRound },
] as const;

type State =
  | { kind: "loading" }
  | { kind: "ok"; user: User; profile: UserProfile | null };

function PortalLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function resolve() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        void navigate({ to: "/portal/sign-in", replace: true });
        return;
      }
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).maybeSingle<UserProfile>();
      if (!active) return;
      setState({ kind: "ok", user: data.user, profile: profile ?? null });
      void supabase.from("user_profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", data.user.id);
    }
    void resolve();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") void navigate({ to: "/portal/sign-in", replace: true });
      if (event === "SIGNED_IN" || event === "USER_UPDATED") Promise.resolve().then(resolve);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/portal/sign-in", replace: true });
  }

  if (state.kind === "loading") {
    return <div className="flex min-h-dvh items-center justify-center" role="status"><Loader2 className="size-6 animate-spin text-primary" /><span className="sr-only">Loading your account…</span></div>;
  }

  const session = { user: state.user, profile: state.profile };
  const nav = <nav aria-label="My TECH-UP" className="flex flex-col gap-1">
    {NAV.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)} activeOptions={{ exact: to === "/portal" }} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary" activeProps={{ className: "bg-secondary text-primary" }}><Icon className="size-4" />{label}</Link>)}
    <Link to="/services" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"><BookOpen className="size-4" />Service requests</Link>
  </nav>;

  return <UserContext.Provider value={session}>
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[250px_1fr]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
        <Link to="/"><BrandLogo compact /></Link>
        <Button variant="ghost" size="icon" aria-label="Toggle account menu" onClick={() => setOpen((v) => !v)}><Menu className="size-5" /></Button>
      </header>
      {open && <div className="border-b border-border bg-background p-3 lg:hidden">{nav}</div>}
      <aside className="hidden min-h-dvh border-r border-border bg-background p-4 lg:flex lg:flex-col">
        <Link to="/" className="mb-7 flex items-center gap-2"><BrandLogo compact /><span className="text-sm font-semibold text-primary">My TECH-UP</span></Link>
        {nav}
        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Bell className="size-4" /><span>Live account updates enabled</span></div>
          <p className="mt-3 truncate text-xs font-medium text-foreground">{state.profile?.full_name || state.user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{state.user.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={() => void signOut()}><LogOut className="size-4" />Sign out</Button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex justify-end lg:hidden"><Button variant="outline" size="sm" onClick={() => void signOut()}><LogOut className="size-4" />Sign out</Button></div>
        <Outlet />
      </main>
    </div>
  </UserContext.Provider>;
}
