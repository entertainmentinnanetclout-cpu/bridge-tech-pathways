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
  head: () => ({ meta: [
    { title: "Staff Sign-in | TECH-UP Admin" },
    { name: "description", content: "Staff-only sign-in for TECH-UP." },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState(() => typeof window !== "undefined" && window.location.hash.includes("type=recovery"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && active) setRecovery(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const isRecovery = window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery");
      if (data.session && !isRecovery) void navigate({ to: "/admin", replace: true });
    });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, [navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      toast.success("Signed in");
      void navigate({ to: "/admin", replace: true });
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }

  async function onReset() {
    if (!email.trim()) { setError("Enter your email first, then choose reset password."); return; }
    setError(null); setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/sign-in`,
      });
      if (resetError) throw resetError;
      toast.success("If that account exists, a reset link has been sent.");
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }

  async function onChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword.length < 12) { setError("Choose a password with at least 12 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true); setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setRecovery(false); setNewPassword(""); setConfirm("");
      window.history.replaceState(null, "", "/admin/sign-in");
      toast.success("Password updated. Sign in with your new password.");
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }

  return (
    <main className="surface-gradient flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <img src={logo.url} alt="TECH-UP logo" className="mx-auto h-14 w-auto" />
        <h1 className="mt-6 text-center text-2xl font-bold text-primary">{recovery ? "Set a new password" : "Staff sign-in"}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{recovery ? "Choose a new password for your TECH-UP staff account." : "Access is limited to authorised TECH-UP staff. There is no public sign-up."}</p>
        {recovery ? (
          <form onSubmit={(e) => void onChangePassword(e)} className="mt-8 space-y-4">
            <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || newPassword.length < 12 || !confirm}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Update password</Button>
          </form>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !email || !password}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Sign in</Button>
            <button type="button" disabled={busy} onClick={() => void onReset()} className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline">Forgot password?</button>
          </form>
        )}
        <a href="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-primary">← Back to website</a>
      </div>
    </main>
  );
}
