import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Briefcase,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";

import logo from "@/assets/techup-logo.png.asset.json";
import { StaffContext, type StaffSession } from "@/components/admin/StaffContext";
import { Button } from "@/components/ui/button";
import { hasRole, supabase, type StaffRole } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin | TECH-UP" },
      { name: "description", content: "TECH-UP staff content management." },
      { property: "og:title", content: "Admin | TECH-UP" },
      { property: "og:description", content: "TECH-UP staff content management." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: typeof Inbox; min: StaffRole }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, min: "viewer" },
  { to: "/admin/programs", label: "Programmes", icon: GraduationCap, min: "viewer" },
  { to: "/admin/opportunities", label: "Opportunities", icon: Briefcase, min: "viewer" },
  { to: "/admin/events", label: "Events", icon: CalendarDays, min: "viewer" },
  { to: "/admin/content", label: "Content", icon: FileText, min: "viewer" },
];

type State = { kind: "loading" } | { kind: "denied"; email: string } | { kind: "ok"; session: StaffSession };

function AdminLayout() {
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
        void navigate({ to: "/admin/sign-in", replace: true });
        return;
      }
      const { data: row } = await supabase
        .from("staff_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle<{ role: StaffRole }>();
      if (!active) return;
      if (!row) setState({ kind: "denied", email: data.user.email ?? "" });
      else setState({ kind: "ok", session: { user: data.user, role: row.role } });
    }
    void resolve();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") void navigate({ to: "/admin/sign-in", replace: true });
      if (event === "SIGNED_IN" || event === "USER_UPDATED") void resolve();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/admin/sign-in", replace: true });
  }

  if (state.kind === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Checking access…</span>
      </div>
    );
  }

  if (state.kind === "denied") {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-primary">No staff access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {state.email} is signed in but has not been assigned a staff role. Ask a super admin to grant access.
          </p>
          <Button className="mt-6" variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  const { session } = state;
  const links = NAV.filter((n) => hasRole(session.role, n.min));

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: to === "/admin" }}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          activeProps={{ className: "bg-secondary font-semibold text-primary" }}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <StaffContext.Provider value={session}>
      <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[240px_1fr]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
          <img src={logo.url} alt="TECH-UP" className="h-9 w-auto" />
          <Button variant="ghost" size="icon" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Menu className="size-5" />
          </Button>
        </header>
        {open && <div className="border-b border-border bg-background p-3 lg:hidden">{nav}</div>}
        <aside className="hidden border-r border-border bg-background p-4 lg:flex lg:min-h-dvh lg:flex-col">
          <Link to="/" className="mb-6 flex items-center gap-2">
            <img src={logo.url} alt="TECH-UP" className="h-10 w-auto" />
            <span className="text-sm font-semibold text-primary">Admin</span>
          </Link>
          {nav}
          <div className="mt-auto border-t border-border pt-4">
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
            <p className="text-xs font-medium text-primary capitalize">{session.role.replace("_", " ")}</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}>
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </Button>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex justify-end lg:hidden">
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </Button>
          </div>
          <Outlet />
        </main>
      </div>
    </StaffContext.Provider>
  );
}
