import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { errorMessage, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

type Profile={id:string;email:string|null;full_name:string;phone:string|null;province:string|null;municipality:string|null;school_name:string|null;current_stage:string;highest_qualification:string|null;onboarding_completed:boolean;last_seen_at:string|null;created_at:string};

export const Route=createFileRoute("/admin/users")({
  head:()=>({meta:[{title:"Users | TECH-UP Admin"},{name:"robots",content:"noindex, nofollow"}]}),
  component:UsersPage,
});

function UsersPage(){
  const [search,setSearch]=useState("");
  const [stage,setStage]=useState("all");
  useRealtimeRefresh(["user_profiles"],"admin");
  const q=useQuery({queryKey:["admin","users"],queryFn:async()=>{
    const {data,error}=await supabase.from("user_profiles").select("id,email,full_name,phone,province,municipality,school_name,current_stage,highest_qualification,onboarding_completed,last_seen_at,created_at").order("created_at",{ascending:false}).limit(1000);
    if(error)throw error;return (data??[]) as Profile[];
  }});
  const rows=(q.data??[]).filter((u)=>(stage==="all"||u.current_stage===stage)&&[u.full_name,u.email,u.phone??"",u.school_name??"",u.municipality??""].join(" ").toLowerCase().includes(search.toLowerCase()));
  const stages=[...new Set((q.data??[]).map((u)=>u.current_stage))].sort();

  return <section><div><h1 className="text-2xl font-bold text-primary">Users</h1><p className="mt-1 text-sm text-muted-foreground">Registered TECH-UP account holders and their self-managed profiles. Authentication passwords are never visible here.</p></div>
    <div className="mt-5 flex flex-wrap gap-3"><div className="relative w-full max-w-sm"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search users" /></div><select value={stage} onChange={(e)=>setStage(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All stages</option>{stages.map((s)=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
    {q.isError&&<p className="mt-5 text-sm text-destructive">{errorMessage(q.error)}</p>}
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      {q.isLoading?<p className="p-6 text-sm text-muted-foreground">Loading users…</p>:rows.length===0?<p className="p-6 text-sm text-muted-foreground">No matching users.</p>:<div className="divide-y divide-border">{rows.map((u)=><article key={u.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><UserRound className="size-4" /></span><div className="min-w-0"><p className="truncate font-semibold">{u.full_name||"Unnamed user"}</p><p className="truncate text-xs text-muted-foreground">{u.email||u.id}</p></div></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-11 text-xs text-muted-foreground"><span>{u.current_stage.replaceAll("_"," ")}</span>{u.phone&&<span>{u.phone}</span>}{(u.municipality||u.province)&&<span>{[u.municipality,u.province].filter(Boolean).join(", ")}</span>}{u.school_name&&<span>{u.school_name}</span>}</div></div><div className="text-left text-xs text-muted-foreground sm:text-right"><p>{u.onboarding_completed?"Profile complete":"Profile incomplete"}</p><p className="mt-1">Joined {new Date(u.created_at).toLocaleDateString("en-ZA")}</p><p className="mt-1">{u.last_seen_at?"Seen "+new Date(u.last_seen_at).toLocaleString("en-ZA"):"Not seen in portal yet"}</p></div></article>)}</div>}
    </div>
  </section>;
}
