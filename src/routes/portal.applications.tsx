import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { usePortalUser } from "@/components/portal/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

const TYPES = ["tertiary","tvet","bursary","course","internship","employment","other"] as const;
type Application = { id:string; application_type:string; institution:string|null; programme:string; qualification_level:string|null; academic_year:number; notes:string; status:string; reference_number:string|null; staff_response:string; created_at:string; updated_at:string };

export const Route = createFileRoute("/portal/applications")({
  head: () => ({ meta: [{ title: "Applications | My TECH-UP" }, { name:"robots",content:"noindex, nofollow" }] }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { user } = usePortalUser();
  const qc = useQueryClient();
  const [open,setOpen]=useState(false);
  const [type,setType]=useState<(typeof TYPES)[number]>("tertiary");
  const [institution,setInstitution]=useState("");
  const [programme,setProgramme]=useState("");
  const [level,setLevel]=useState("");
  const [year,setYear]=useState(String(new Date().getFullYear()+1));
  const [notes,setNotes]=useState("");
  const [saving,setSaving]=useState(false);
  useRealtimeRefresh(["applications","notifications"],"portal");

  const q=useQuery({queryKey:["portal","applications",user.id],queryFn:async()=>{
    const {data,error}=await supabase.from("applications").select("id,application_type,institution,programme,qualification_level,academic_year,notes,status,reference_number,staff_response,created_at,updated_at").eq("user_id",user.id).order("created_at",{ascending:false});
    if(error) throw error; return (data??[]) as Application[];
  }});

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if(saving) return;
    if(programme.trim().length<2){toast.error("Enter the course, programme or opportunity you need help with.");return;}
    setSaving(true);
    const {error}=await supabase.from("applications").insert({
      user_id:user.id,application_type:type,institution:institution.trim()||null,programme:programme.trim(),
      qualification_level:level.trim()||null,academic_year:Number(year),notes:notes.trim(),status:"submitted",
      submitted_at:new Date().toISOString(),
    });
    setSaving(false);
    if(error){toast.error(errorMessage(error));return;}
    toast.success("Application support request submitted");
    setInstitution("");setProgramme("");setLevel("");setNotes("");setOpen(false);
    await qc.invalidateQueries({queryKey:["portal"]});
  }

  return <section>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-primary">Applications</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Create and track application-support records for tertiary study, TVET, bursaries, courses, internships and other opportunities.</p></div><Button onClick={()=>setOpen((v)=>!v)}><PlusCircle className="size-4" />{open?"Close form":"New application"}</Button></div>
    {open && <form onSubmit={(e)=>void submit(e)} className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="app-type">Application type</Label><select id="app-type" value={type} onChange={(e)=>setType(e.target.value as typeof type)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{TYPES.map((t)=><option key={t} value={t}>{t.replaceAll("_"," ")}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="app-year">Academic / intake year</Label><Input id="app-year" type="number" min={new Date().getFullYear()} max={new Date().getFullYear()+5} required value={year} onChange={(e)=>setYear(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="app-institution">Institution / organisation</Label><Input id="app-institution" value={institution} onChange={(e)=>setInstitution(e.target.value)} placeholder="e.g. University, TVET college, bursary provider" /></div>
      <div className="space-y-2"><Label htmlFor="app-programme">Course / programme / opportunity *</Label><Input id="app-programme" required value={programme} onChange={(e)=>setProgramme(e.target.value)} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="app-level">Qualification level <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="app-level" value={level} onChange={(e)=>setLevel(e.target.value)} placeholder="Certificate, Diploma, Degree, etc." /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="app-notes">What assistance do you need?</Label><Textarea id="app-notes" rows={4} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Tell TECH-UP what you have done already, deadlines, documents you have, or where you are stuck." /></div>
      <div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving?"Submitting…":"Submit to TECH-UP"}</Button><p className="mt-2 text-xs text-muted-foreground">This submits a support record to TECH-UP. It is not itself an official application to the institution.</p></div>
    </form>}
    {q.isError && <p className="mt-5 text-sm text-destructive">{errorMessage(q.error)}</p>}
    <div className="mt-7 grid gap-4">
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading applications…</p>}
      {q.isSuccess && q.data.length===0 && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No application-support records yet.</p>}
      {q.data?.map((a)=><article key={a.id} className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-turquoise">{a.application_type.replaceAll("_"," ")}</p><h2 className="mt-1 text-lg font-semibold text-foreground">{a.programme}</h2><p className="mt-1 text-sm text-muted-foreground">{a.institution||"Institution not selected"} · {a.academic_year}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-primary">{a.status.replaceAll("_"," ")}</span></div>
        {a.reference_number && <p className="mt-4 text-sm"><span className="font-semibold">Reference:</span> {a.reference_number}</p>}
        {a.staff_response && <div className="mt-4 rounded-xl bg-secondary/70 p-4"><p className="text-xs font-semibold uppercase text-primary">TECH-UP update</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{a.staff_response}</p></div>}
        <p className="mt-4 text-xs text-muted-foreground">Created {new Date(a.created_at).toLocaleString("en-ZA")} · Updated {new Date(a.updated_at).toLocaleString("en-ZA")}</p>
      </article>)}
    </div>
  </section>;
}
