import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

type Fields = { full_name: string; email: string; subject: string; message: string; website: string };
const EMPTY: Fields = { full_name: "", email: "", subject: "", message: "", website: "" };
export function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [feedback, setFeedback] = useState("");
  const set = (key: keyof Fields, value: string) => setFields((current) => ({ ...current, [key]: value }));
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    if (!consent || fields.full_name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(fields.email.trim()) || fields.subject.trim().length < 2 || fields.message.trim().length < 10) {
      setFeedback("Complete all fields and consent to submitting your enquiry."); setStatus("failed"); return;
    }
    setStatus("sending"); setFeedback("");
    try {
      const { data, error } = await supabase.functions.invoke("submit-contact", { body: { ...fields, consent } });
      if (error || !data?.ok) {
        let msg = typeof data?.error === "string" ? data.error : "Unable to send your enquiry. Please try again.";
        if (error && "context" in error && error.context instanceof Response) {
          try { const body = await error.context.json(); if (typeof body?.error === "string") msg = body.error; } catch { /* keep generic message */ }
        }
        throw new Error(msg);
      }
      setStatus("sent"); setFeedback("Thank you. Your enquiry has been received by TECH-UP."); setFields(EMPTY); setConsent(false);
    } catch (err) { setStatus("failed"); setFeedback(err instanceof Error ? err.message : "Unable to send your enquiry. Please try again."); }
  }
  return <div className="mt-12 max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-8">
    <h3 className="text-xl font-bold text-primary">Send an enquiry</h3><p className="mt-2 text-sm text-muted-foreground">For programme, partnership or general enquiries. Please do not submit IDs, academic documents or other sensitive records here.</p>
    <form onSubmit={(e) => void submit(e)} className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="contact-name">Full name</label><Input id="contact-name" required maxLength={120} minLength={2} value={fields.full_name} onChange={(e) => set("full_name", e.target.value)} autoComplete="name" /></div>
      <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="contact-email">Email</label><Input id="contact-email" type="email" required maxLength={254} value={fields.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></div>
      <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold" htmlFor="contact-subject">Subject</label><Input id="contact-subject" required minLength={2} maxLength={160} value={fields.subject} onChange={(e) => set("subject", e.target.value)} /></div>
      <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold" htmlFor="contact-message">Message</label><Textarea id="contact-message" required rows={5} minLength={10} maxLength={5000} value={fields.message} onChange={(e) => set("message", e.target.value)} /></div>
      <div className="hidden" aria-hidden="true"><label htmlFor="company-site">Website</label><Input id="company-site" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(e) => set("website", e.target.value)} /></div>
      <label className="flex items-start gap-3 text-sm text-muted-foreground sm:col-span-2"><input type="checkbox" className="mt-1 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /><span>I consent to TECH-UP processing the information in this message in order to respond to my enquiry.</span></label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2"><Button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send enquiry"}</Button>{feedback && <p role="status" className={`text-sm ${status === "failed" ? "text-destructive" : "text-primary"}`}>{feedback}</p>}</div>
    </form>
  </div>;
}
