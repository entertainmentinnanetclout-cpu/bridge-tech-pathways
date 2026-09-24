import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase, errorMessage } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/services_/sign-in")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in or register | TECH-UP Services" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ServiceSignIn,
});
type Mode = "sign-in" | "register" | "forgot" | "new-password";
function ServiceSignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let mounted = true;
    const recovering = new URLSearchParams(window.location.search).get("recovery") === "1";
    if (recovering) setMode("new-password");
    void supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user && !recovering) void navigate({ to: "/services", replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") setMode("new-password");
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);
  function switchMode(next: Mode) { setMode(next); setMessage(""); setFailed(false); setPassword(""); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      if (mode === "forgot") {
        if (!email.trim()) throw new Error("Enter your email address.");
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/services/sign-in?recovery=1` });
        if (error) throw error;
        setMessage("If this email is registered, a password-reset link has been sent. Check your inbox.");
      } else if (mode === "new-password") {
        if (password.length < 8) throw new Error("Use a password of at least 8 characters.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword(""); setMessage("Password updated. You can continue to your services dashboard.");
        await navigate({ to: "/services", replace: true });
      } else if (mode === "register") {
        if (name.trim().length < 2 || name.trim().length > 120) throw new Error("Enter your full name.");
        if (password.length < 8) throw new Error("Use a password of at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/services` },
        });
        if (error) throw error;
        setPassword("");
        if (data.session) await navigate({ to: "/services", replace: true });
        else setMessage("Check your email for a confirmation link, then sign in. If you already have an account, use the sign-in tab.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword("");
        await navigate({ to: "/services", replace: true });
      }
    } catch (error) { setFailed(true); setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <main className="surface-gradient flex min-h-dvh items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-9">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="size-4" /> TECH-UP home</Link>
      <div className="mt-6 flex items-center gap-3"><img src="/favicon.png" alt="" width={48} height={48} className="size-12 object-contain" /><span className="text-xl font-bold text-primary">TECH-UP Services</span></div>
      <h1 className="mt-7 text-2xl font-bold tracking-tight text-primary">{mode === "register" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "new-password" ? "Choose a new password" : "Welcome back"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode === "register" ? "Register to request and track TECH-UP services. Tertiary applications remain subject to official institutional processes." : mode === "sign-in" ? "Sign in to submit and track service requests." : mode === "forgot" ? "We'll send a reset link if your account exists." : "Choose a secure password for your account."}</p>
      {(mode === "sign-in" || mode === "register") && <div className="mt-6 grid grid-cols-2 rounded-xl bg-secondary p-1" role="group" aria-label="Account access"><button type="button" onClick={() => switchMode("sign-in")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "sign-in" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>Sign in</button><button type="button" onClick={() => switchMode("register")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>Register</button></div>}
      <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
        {mode === "register" && <div className="space-y-2"><Label htmlFor="service-name">Full name</Label><Input id="service-name" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} /></div>}
        {mode !== "new-password" && <div className="space-y-2"><Label htmlFor="service-email">Email address</Label><Input id="service-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></div>}
        {mode !== "forgot" && <div className="space-y-2"><Label htmlFor="service-password">{mode === "new-password" ? "New password" : "Password"}</Label><Input id="service-password" type="password" autoComplete={mode === "register" || mode === "new-password" ? "new-password" : "current-password"} required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
        {message && <p role={failed ? "alert" : "status"} className={`rounded-lg p-3 text-sm ${failed ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"}`}>{message}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{mode === "register" ? "Register" : mode === "forgot" ? "Send reset link" : mode === "new-password" ? "Save new password" : "Sign in"}</Button>
      </form>
      {mode === "sign-in" && <button type="button" onClick={() => switchMode("forgot")} className="mt-5 w-full text-sm text-muted-foreground underline underline-offset-4">Forgot password?</button>}
      {(mode === "forgot" || mode === "new-password") && <button type="button" onClick={() => switchMode("sign-in")} className="mt-5 w-full text-sm text-muted-foreground underline underline-offset-4">Back to sign in</button>}
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">Your service account does not grant access to the TECH-UP staff administration portal.</p>
    </div>
  </main>;
}
