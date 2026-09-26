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

const STATUSES=["interested","applied","enrolled","waitlisted","completed","cancelled"];
type Enrollment={id:string;course_id:string;user_id:string;motivation:string;status:string;staff_notes:string;created_at:string;updated_at:string};
type Course={id:string;title:string};
type Profile={id:string;full_name:string;email:string|null;phone:string|null};

export const Route=createFileRoute("/admin/enrollments")({
  head:()=>({meta:[{title:"Course Enrolments | TECH-UP Admin"},{name:"robots",content:"noindex, nofollow"}]}),
  component:EnrollmentsAdmin,
});

function EnrollmentsAdmin(){
  const {role}=useStaff();const canManage=hasRole(role,"editor");const qc=useQueryClient();
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("all");const [selected,setSelected]=useState<string|null>(null);const [status,setStatus]=useState("interested");const [notes,setNotes]=useState("");const [saving,setSaving]=useState(false);
  useRealtimeRefresh(["course_enrollments","courses","user_profiles"],"admin");
  const q=useQuery({queryKey:["admin","enrollments"],queryFn:async()=>{
    const [e,c,p]=await Promise.all([
      supabase.from("course_enrollments").select("*").order("created_at",{ascending:false}).limit(1000),
      supabase.from("courses").select("id,title").limit(1000),
      supabase.from("user_profiles").select("id,full_name,email,phone").limit(1000),
    ]);
    if(e.error)throw e.error;if(c.error)throw c.error;if(p.error)throw p.error;
    return {rows:(e.data??[]) as Enrollment[],courses:new Map(((c.data??[]) as Course[]).map(x=>[x.id,x])),profiles:new Map(((p.data??[]) as Profile[]).map(x=>[x.id,x]))};
  }});
  const rows=(q.data?.rows??[]).filter((e)=>(filter==="all"||e.status===filter)&&[
    q.data?.courses.get(e.course_id)?.title??"",
    q.data?.profiles.get(e.user_id)?.full_name??"",
    q.data?.profiles.get(e.user_id)?.email??""
  ].join(" ").toLowerCase().includes(search.toLowerCase()));
  const active=q.data?.rows.find(x=>x.id===selected);const course=active?q.data?.courses.get(active.course_id):undefined;const person=active?q.data?.profiles.get(active.user_id):undefined;
  function choose(e:Enrollment){setSelected(e.id);setStatus(e.status);setNotes(e.staff_notes);}
  async function save(){if(!active||!canManage||saving)return;setSaving(true);const {error}=await supabase.from("course_enrollments").update({status,staff_notes:notes.trim()}).eq("id",active.id);setSaving(false);if(error){toast.error(errorMessage(error));return;}await logAudit("update","course_enrollments",active.id);toast.success("Enrolment updated");await qc.invalidateQueries({queryKey:["admin"]});}
  return <section><h1 className="text-2xl font-bold text-primary">Course enrolments</h1><p className="mt-1 text-sm text-muted-foreground">Track course interest, applications, enrolment and completion.</p><div className="mt-5 flex flex-wrap gap-3"><Input className="max-w-sm" placeholder="Search course or learner" value={search} onChange={(e)=>setSearch(e.target.value)} /><select value={filter} onChange={(e)=>setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(280px,.85fr)_minmax(0,1.4fr)]"><div className="max-h-[720px] space-y-2 overflow-y-auto">{q.isError&&<p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{errorMessage(q.error)}</p>}{rows.map((e)=>{const c=q.data?.courses.get(e.course_id);const p=q.data?.profiles.get(e.user_id);return <button key={e.id} type="button" onClick={()=>choose(e)} className={"w-full rounded-xl border p-4 text-left "+(selected===e.id?"border-primary bg-secondary":"border-border bg-card")}><p className="font-semibold">{c?.title||"Unknown course"}</p><p className="mt-1 text-xs text-muted-foreground">{p?.full_name||p?.email||e.user_id}</p><p className="mt-2 text-xs capitalize text-muted-foreground">{e.status}</p></button>})}{q.isSuccess&&rows.length===0&&<p className="rounded-xl border p-5 text-sm text-muted-foreground">No enrolments yet.</p>}</div><div className="rounded-2xl border border-border bg-card p-5">{!active?<p className="text-sm text-muted-foreground">Select an enrolment.</p>:<div className="space-y-5"><div><h2 className="text-xl font-semibold">{course?.title||"Course"}</h2><p className="mt-1 text-sm text-muted-foreground">{person?.full_name||"Unnamed learner"} · {person?.email||active.user_id}</p>{person?.phone&&<p className="mt-1 text-sm">{person.phone}</p>}</div>{active.motivation&&<div className="rounded-xl bg-secondary/60 p-4 text-sm">{active.motivation}</div>}<div className="space-y-2"><label htmlFor="enrol-status" className="text-sm font-semibold">Status</label><select id="enrol-status" disabled={!canManage} value={status} onChange={(e)=>setStatus(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div className="space-y-2"><label htmlFor="enrol-notes" className="text-sm font-semibold">Internal notes</label><Textarea id="enrol-notes" disabled={!canManage} rows={5} value={notes} onChange={(e)=>setNotes(e.target.value)} /></div>{canManage&&<Button onClick={()=>void save()} disabled={saving}>{saving?"Saving…":"Save enrolment"}</Button>}</div>}</div></div>
  </section>;
}
