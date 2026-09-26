import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/portal_/sign-in")({
  ssr: false,
  head: () => ({ meta: [{ title: "Create account or sign in | My TECH-UP" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PortalSignIn,
});

type Mode = "sign-in" | "register" | "forgot" | "new-password";

function PortalSignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
      if (mounted && data.user && !recovering) void navigate({ to: "/portal", replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (mounted && event === "PASSWORD_RECOVERY") setMode("new-password");
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  function switchMode(next: Mode) {
    setMode(next); setMessage(""); setFailed(false); setPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      if (mode === "forgot") {
        if (!email.trim()) throw new Error("Enter your email address.");
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/portal/sign-in?recovery=1`,
        });
        if (error) throw error;
        setMessage("If the account exists, a password-reset link has been sent.");
      } else if (mode === "new-password") {
        if (password.length < 8) throw new Error("Use a password of at least 8 characters.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        await navigate({ to: "/portal", replace: true });
      } else if (mode === "register") {
        if (fullName.trim().length < 2) throw new Error("Enter your full name.");
        if (password.length < 8) throw new Error("Use a password of at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), phone: phone.trim() || null },
            emailRedirectTo: `${window.location.origin}/portal`,
          },
        });
        if (error) throw error;
        setPassword("");
        if (data.session) await navigate({ to: "/portal", replace: true });
        else setMessage("Account created. Check your email for the confirmation link, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await navigate({ to: "/portal", replace: true });
      }
    } catch (error) {
      setFailed(true); setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return <main className="surface-gradient flex min-h-dvh items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-9">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="size-4" />TECH-UP home</Link>
      <div className="mt-6 flex items-center gap-3"><img src="/favicon.png" alt="" className="size-12 object-contain" /><div><p className="font-bold text-primary">My TECH-UP</p><p className="text-xs text-muted-foreground">Applications · Courses · Assistance</p></div></div>
      <h1 className="mt-7 text-2xl font-bold text-primary">{mode === "register" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "new-password" ? "Choose a new password" : "Welcome back"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode === "register" ? "Create one account to request assistance, track TECH-UP application support, join courses and receive updates." : mode === "sign-in" ? "Sign in to your TECH-UP account." : mode === "forgot" ? "We'll send a reset link if your account exists." : "Choose a secure new password."}</p>
      {(mode === "sign-in" || mode === "register") && <div className="mt-6 grid grid-cols-2 rounded-xl bg-secondary p-1"><button type="button" onClick={() => switchMode("sign-in")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "sign-in" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>Sign in</button><button type="button" onClick={() => switchMode("register")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>Create account</button></div>}
      <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
        {mode === "register" && <><div className="space-y-2"><Label htmlFor="portal-name">Full name</Label><Input id="portal-name" autoComplete="name" required minLength={2} maxLength={120} value={fullName} onChange={(e) => setFullName(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="portal-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="portal-phone" autoComplete="tel" maxLength={25} value={phone} onChange={(e) => setPhone(e.target.value)} /></div></>}
        {mode !== "new-password" && <div className="space-y-2"><Label htmlFor="portal-email">Email address</Label><Input id="portal-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></div>}
        {mode !== "forgot" && <div className="space-y-2"><Label htmlFor="portal-password">{mode === "new-password" ? "New password" : "Password"}</Label><Input id="portal-password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
        {message && <p role={failed ? "alert" : "status"} className={`rounded-lg p-3 text-sm ${failed ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"}`}>{message}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />}{mode === "register" ? "Create account" : mode === "forgot" ? "Send reset link" : mode === "new-password" ? "Save password" : "Sign in"}</Button>
      </form>
      {mode === "sign-in" && <button type="button" onClick={() => switchMode("forgot")} className="mt-5 w-full text-sm text-muted-foreground underline underline-offset-4">Forgot password?</button>}
      {(mode === "forgot" || mode === "new-password") && <button type="button" onClick={() => switchMode("sign-in")} className="mt-5 w-full text-sm text-muted-foreground underline underline-offset-4">Back to sign in</button>}
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">TECH-UP support does not replace an institution's official admission process or guarantee an admission outcome.</p>
    </div>
  </main>;
}
