import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import logo from "@/assets/techup-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin_/sign-in")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Sign-in | TECH-UP Admin" },
      { name: "description", content: "Staff-only sign-in for the TECH-UP content admin." },
      { property: "og:title", content: "Staff Sign-in | TECH-UP Admin" },
      { property: "og:description", content: "Staff-only sign-in for the TECH-UP content admin." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
      toast.success("Signed in");
      void navigate({ to: "/admin", replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onReset() {
    if (!email.trim()) {
      setError("Enter your email first, then choose reset password.");
      return;
    }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/sign-in`,
    });
    if (err) setError(errorMessage(err));
    else toast.success("If that account exists, a reset link has been sent.");
  }

  return (
    <main className="surface-gradient flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <img src={logo.url} alt="TECH-UP logo" className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center text-2xl font-bold text-primary">Staff sign-in</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Access is limited to authorised TECH-UP staff. There is no public sign-up.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy || !email || !password}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Sign in
          </Button>
          <button type="button" onClick={onReset} className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline">
            Forgot password?
          </button>
        </form>
        <a href="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-primary">
          ← Back to website
        </a>
      </div>
    </main>
  );
}
