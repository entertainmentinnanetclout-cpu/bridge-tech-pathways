import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useStaff } from "@/components/admin/StaffContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, hasRole, logAudit, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

const STATUSES=["draft","submitted","in_review","awaiting_information","ready_to_submit","submitted_to_institution","offer_received","unsuccessful","withdrawn","closed"];
type App={id:string;user_id:string;application_type:string;institution:string|null;programme:string;qualification_level:string|null;academic_year:number;notes:string;status:string;reference_number:string|null;staff_response:string;created_at:string;updated_at:string};
type Profile={id:string;full_name:string;email:string|null;phone:string|null};

export const Route=createFileRoute("/admin/applications")({
  head:()=>({meta:[{title:"Applications | TECH-UP Admin"},{name:"robots",content:"noindex, nofollow"}]}),
  component:ApplicationsAdmin,
});

function ApplicationsAdmin(){
  const {role}=useStaff();const canManage=hasRole(role,"editor");const qc=useQueryClient();
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("all");const [selected,setSelected]=useState<string|null>(null);
  const [status,setStatus]=useState("submitted");const [reference,setReference]=useState("");const [response,setResponse]=useState("");const [saving,setSaving]=useState(false);
  useRealtimeRefresh(["applications","user_profiles"],"admin");
  const q=useQuery({queryKey:["admin","applications"],queryFn:async()=>{
    const [apps,profiles]=await Promise.all([
      supabase.from("applications").select("*").order("created_at",{ascending:false}).limit(1000),
      supabase.from("user_profiles").select("id,full_name,email,phone").limit(1000),
    ]);
    if(apps.error)throw apps.error;if(profiles.error)throw profiles.error;
    return {apps:(apps.data??[]) as App[],profiles:new Map(((profiles.data??[]) as Profile[]).map((p)=>[p.id,p]))};
  }});
  const rows=(q.data?.apps??[]).filter((a)=>(filter==="all"||a.status===filter)&&[
    a.programme,a.institution??"",a.application_type,
    q.data?.profiles.get(a.user_id)?.full_name??"",
    q.data?.profiles.get(a.user_id)?.email??""
  ].join(" ").toLowerCase().includes(search.toLowerCase()));
  const active=q.data?.apps.find((a)=>a.id===selected);const person=active?q.data?.profiles.get(active.user_id):undefined;
  function choose(a:App){setSelected(a.id);setStatus(a.status);setReference(a.reference_number??"");setResponse(a.staff_response);}
  async function save(){if(!active||!canManage||saving)return;setSaving(true);const {error}=await supabase.from("applications").update({status,reference_number:reference.trim()||null,staff_response:response.trim()}).eq("id",active.id);setSaving(false);if(error){toast.error(errorMessage(error));return;}await logAudit("update","applications",active.id);toast.success("Application updated");await qc.invalidateQueries({queryKey:["admin"]});}
  return <section><h1 className="text-2xl font-bold text-primary">Applications</h1><p className="mt-1 text-sm text-muted-foreground">Manage TECH-UP application-support records from account holders. This workflow tracks support; it does not replace an institution's own application system.</p>
    <div className="mt-5 flex flex-wrap gap-3"><Input className="max-w-sm" placeholder="Search applicant, institution or programme" value={search} onChange={(e)=>setSearch(e.target.value)} /><select value={filter} onChange={(e)=>setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option>{STATUSES.map((s)=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
    {q.isError&&<p className="mt-5 text-sm text-destructive">{errorMessage(q.error)}</p>}
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(280px,.85fr)_minmax(0,1.4fr)]">
      <div className="max-h-[720px] space-y-2 overflow-y-auto">{q.isLoading&&<p className="rounded-xl border p-5 text-sm text-muted-foreground">Loading…</p>}{rows.map((a)=>{const p=q.data?.profiles.get(a.user_id);return <button key={a.id} type="button" onClick={()=>choose(a)} className={"w-full rounded-xl border p-4 text-left hover:border-primary "+(selected===a.id?"border-primary bg-secondary":"border-border bg-card")}><span className="block text-xs font-semibold uppercase text-brand-turquoise">{a.application_type.replaceAll("_"," ")}</span><span className="mt-1 block font-semibold">{a.programme}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{p?.full_name||p?.email||a.user_id}</span><span className="mt-2 block text-xs capitalize text-muted-foreground">{a.status.replaceAll("_"," ")} · {new Date(a.created_at).toLocaleDateString("en-ZA")}</span></button>})}{q.isSuccess&&rows.length===0&&<p className="rounded-xl border p-5 text-sm text-muted-foreground">No matching applications.</p>}</div>
      <div className="rounded-2xl border border-border bg-card p-5">{!active?<p className="text-sm text-muted-foreground">Select an application to review it.</p>:<div className="space-y-5"><div><p className="text-xs font-semibold uppercase text-brand-turquoise">{active.application_type.replaceAll("_"," ")}</p><h2 className="mt-1 text-xl font-semibold">{active.programme}</h2><p className="mt-1 text-sm text-muted-foreground">{active.institution||"Institution not selected"} · {active.academic_year}</p><p className="mt-2 text-sm"><span className="font-semibold">Applicant:</span> {person?.full_name||"Unnamed"} {person?.email&&<>· <a className="underline" href={"mailto:"+person.email}>{person.email}</a></>}</p>{person?.phone&&<p className="mt-1 text-sm">Phone: <a className="underline" href={"tel:"+person.phone}>{person.phone}</a></p>}</div>{active.notes&&<div className="rounded-xl bg-secondary/60 p-4"><p className="text-xs font-semibold uppercase">Applicant notes</p><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{active.notes}</p></div>}
        <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="admin-app-status">Status</label><select id="admin-app-status" disabled={!canManage} value={status} onChange={(e)=>setStatus(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{STATUSES.map((s)=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
        <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="admin-app-ref">Reference number</label><Input id="admin-app-ref" disabled={!canManage} value={reference} onChange={(e)=>setReference(e.target.value)} placeholder="Official / internal reference if available" /></div>
        <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="admin-app-response">Update visible to applicant</label><Textarea id="admin-app-response" disabled={!canManage} rows={6} value={response} onChange={(e)=>setResponse(e.target.value)} /></div>
        {canManage?<Button onClick={()=>void save()} disabled={saving}>{saving?"Saving…":"Save application update"}</Button>:<p className="text-xs text-muted-foreground">Your staff role is read-only.</p>}
      </div>}</div>
    </div>
  </section>;
}
