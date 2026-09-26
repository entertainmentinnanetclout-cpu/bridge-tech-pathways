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

const CATEGORIES=["application_help","course_guidance","bursary_help","document_help","career_guidance","digital_help","accessibility","other"] as const;
type Help={id:string;category:string;subject:string;description:string;priority:string;status:string;staff_response:string;created_at:string;updated_at:string};

export const Route=createFileRoute("/portal/assistance")({
  head:()=>({meta:[{title:"Assistance | My TECH-UP"},{name:"robots",content:"noindex, nofollow"}]}),
  component:AssistancePage,
});

function AssistancePage(){
  const {user}=usePortalUser();
  const qc=useQueryClient();
  const [open,setOpen]=useState(false);
  const [category,setCategory]=useState<(typeof CATEGORIES)[number]>("application_help");
  const [subject,setSubject]=useState("");
  const [description,setDescription]=useState("");
  const [priority,setPriority]=useState("normal");
  const [saving,setSaving]=useState(false);
  useRealtimeRefresh(["assistance_requests","notifications"],"portal");

  const q=useQuery({queryKey:["portal","assistance",user.id],queryFn:async()=>{
    const {data,error}=await supabase.from("assistance_requests").select("id,category,subject,description,priority,status,staff_response,created_at,updated_at").eq("user_id",user.id).order("created_at",{ascending:false});
    if(error) throw error;return (data??[]) as Help[];
  }});

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(saving)return;
    if(subject.trim().length<3||description.trim().length<10){toast.error("Add a clear subject and at least 10 characters of detail.");return;}
    setSaving(true);
    const {error}=await supabase.from("assistance_requests").insert({user_id:user.id,category,subject:subject.trim(),description:description.trim(),priority,status:"open"});
    setSaving(false);
    if(error){toast.error(errorMessage(error));return;}
    toast.success("Assistance request submitted");setSubject("");setDescription("");setPriority("normal");setOpen(false);
    await qc.invalidateQueries({queryKey:["portal"]});
  }

  return <section><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-primary">Assistance</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Ask TECH-UP for practical help with applications, courses, bursaries, documents, career guidance or digital access.</p></div><Button onClick={()=>setOpen((v)=>!v)}><PlusCircle className="size-4" />{open?"Close form":"Request assistance"}</Button></div>
    {open&&<form onSubmit={(e)=>void submit(e)} className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="help-category">Category</Label><select id="help-category" value={category} onChange={(e)=>setCategory(e.target.value as typeof category)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{CATEGORIES.map((c)=><option key={c} value={c}>{c.replaceAll("_"," ")}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="help-priority">Priority</Label><select id="help-priority" value={priority} onChange={(e)=>setPriority(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="help-subject">Subject</Label><Input id="help-subject" required value={subject} onChange={(e)=>setSubject(e.target.value)} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="help-description">Explain what you need</Label><Textarea id="help-description" rows={5} required minLength={10} value={description} onChange={(e)=>setDescription(e.target.value)} /></div>
      <div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving?"Submitting…":"Submit request"}</Button></div>
    </form>}
    {q.isError&&<p className="mt-5 text-sm text-destructive">{errorMessage(q.error)}</p>}
    <div className="mt-7 grid gap-4">{q.isLoading&&<p className="text-sm text-muted-foreground">Loading requests…</p>}{q.isSuccess&&q.data.length===0&&<p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">You have not requested assistance yet.</p>}
      {q.data?.map((h)=><article key={h.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-brand-turquoise">{h.category.replaceAll("_"," ")}</p><h2 className="mt-1 text-lg font-semibold">{h.subject}</h2><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{h.description}</p></div><div className="flex gap-2"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">{h.priority}</span><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">{h.status.replaceAll("_"," ")}</span></div></div>{h.staff_response&&<div className="mt-4 rounded-xl bg-secondary/70 p-4"><p className="text-xs font-semibold uppercase text-primary">TECH-UP response</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{h.staff_response}</p></div>}<p className="mt-4 text-xs text-muted-foreground">Updated {new Date(h.updated_at).toLocaleString("en-ZA")}</p></article>)}
    </div>
  </section>;
}
