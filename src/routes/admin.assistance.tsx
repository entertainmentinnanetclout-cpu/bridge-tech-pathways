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

const STATUSES=["open","assigned","waiting_user","in_progress","resolved","closed"];
type Help={id:string;user_id:string;category:string;subject:string;description:string;priority:string;status:string;staff_response:string;assigned_to:string|null;created_at:string;updated_at:string};
type Profile={id:string;full_name:string;email:string|null;phone:string|null};

export const Route=createFileRoute("/admin/assistance")({
  head:()=>({meta:[{title:"Assistance | TECH-UP Admin"},{name:"robots",content:"noindex, nofollow"}]}),
  component:AssistanceAdmin,
});

function AssistanceAdmin(){
  const {role}=useStaff();const canManage=hasRole(role,"editor");const qc=useQueryClient();
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("all");const [selected,setSelected]=useState<string|null>(null);const [status,setStatus]=useState("open");const [response,setResponse]=useState("");const [saving,setSaving]=useState(false);
  useRealtimeRefresh(["assistance_requests","user_profiles"],"admin");
  const q=useQuery({queryKey:["admin","assistance"],queryFn:async()=>{
    const [h,p]=await Promise.all([supabase.from("assistance_requests").select("*").order("created_at",{ascending:false}).limit(1000),supabase.from("user_profiles").select("id,full_name,email,phone").limit(1000)]);
    if(h.error)throw h.error;if(p.error)throw p.error;return {rows:(h.data??[]) as Help[],profiles:new Map(((p.data??[]) as Profile[]).map(x=>[x.id,x]))};
  }});
  const rows=(q.data?.rows??[]).filter((h)=>(filter==="all"||h.status===filter)&&[
    h.subject,h.description,h.category,q.data?.profiles.get(h.user_id)?.full_name??"",q.data?.profiles.get(h.user_id)?.email??""
  ].join(" ").toLowerCase().includes(search.toLowerCase()));
  const active=q.data?.rows.find(x=>x.id===selected);const person=active?q.data?.profiles.get(active.user_id):undefined;
  function choose(h:Help){setSelected(h.id);setStatus(h.status);setResponse(h.staff_response);}
  async function save(){if(!active||!canManage||saving)return;setSaving(true);const {error}=await supabase.from("assistance_requests").update({status,staff_response:response.trim()}).eq("id",active.id);setSaving(false);if(error){toast.error(errorMessage(error));return;}await logAudit("update","assistance_requests",active.id);toast.success("Assistance request updated");await qc.invalidateQueries({queryKey:["admin"]});}
  return <section><h1 className="text-2xl font-bold text-primary">Assistance requests</h1><p className="mt-1 text-sm text-muted-foreground">Handle application help, course guidance, bursary support, document assistance and other user needs.</p><div className="mt-5 flex flex-wrap gap-3"><Input className="max-w-sm" placeholder="Search requests" value={search} onChange={(e)=>setSearch(e.target.value)} /><select value={filter} onChange={(e)=>setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(280px,.85fr)_minmax(0,1.4fr)]"><div className="max-h-[720px] space-y-2 overflow-y-auto">{q.isError&&<p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{errorMessage(q.error)}</p>}{rows.map((h)=>{const p=q.data?.profiles.get(h.user_id);return <button key={h.id} type="button" onClick={()=>choose(h)} className={"w-full rounded-xl border p-4 text-left "+(selected===h.id?"border-primary bg-secondary":"border-border bg-card")}><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold uppercase text-brand-turquoise">{h.category.replaceAll("_"," ")}</span><span className="text-xs font-semibold capitalize">{h.priority}</span></div><p className="mt-1 font-semibold">{h.subject}</p><p className="mt-1 text-xs text-muted-foreground">{p?.full_name||p?.email||h.user_id}</p><p className="mt-2 text-xs capitalize text-muted-foreground">{h.status.replaceAll("_"," ")}</p></button>})}{q.isSuccess&&rows.length===0&&<p className="rounded-xl border p-5 text-sm text-muted-foreground">No matching requests.</p>}</div><div className="rounded-2xl border border-border bg-card p-5">{!active?<p className="text-sm text-muted-foreground">Select a request.</p>:<div className="space-y-5"><div><p className="text-xs font-semibold uppercase text-brand-turquoise">{active.category.replaceAll("_"," ")}</p><h2 className="mt-1 text-xl font-semibold">{active.subject}</h2><p className="mt-2 text-sm">{person?.full_name||"Unnamed user"} · {person?.email||active.user_id}</p>{person?.phone&&<p className="mt-1 text-sm">{person.phone}</p>}</div><p className="whitespace-pre-wrap rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">{active.description}</p><div className="space-y-2"><label htmlFor="help-admin-status" className="text-sm font-semibold">Status</label><select id="help-admin-status" disabled={!canManage} value={status} onChange={(e)=>setStatus(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{STATUSES.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div><div className="space-y-2"><label htmlFor="help-admin-response" className="text-sm font-semibold">Response visible to user</label><Textarea id="help-admin-response" disabled={!canManage} rows={6} value={response} onChange={(e)=>setResponse(e.target.value)} /></div>{canManage&&<Button onClick={()=>void save()} disabled={saving}>{saving?"Saving…":"Save response"}</Button>}</div>}</div></div>
  </section>;
}
