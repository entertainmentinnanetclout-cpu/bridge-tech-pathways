import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { usePortalUser } from "@/components/portal/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, supabase } from "@/lib/supabase";

const STAGES=["prospective_student","matriculant","tvet_student","university_student","graduate","job_seeker","employed","entrepreneur","other"];

export const Route=createFileRoute("/portal/profile")({
  head:()=>({meta:[{title:"Profile | My TECH-UP"},{name:"robots",content:"noindex, nofollow"}]}),
  component:ProfilePage,
});

function ProfilePage(){
  const {user}=usePortalUser();
  const qc=useQueryClient();
  const q=useQuery({queryKey:["portal","profile",user.id],queryFn:async()=>{const {data,error}=await supabase.from("user_profiles").select("*").eq("id",user.id).single();if(error)throw error;return data;}});
  const [form,setForm]=useState({full_name:"",phone:"",province:"",municipality:"",school_name:"",current_stage:"prospective_student",highest_qualification:"",interests:""});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{if(q.data)setForm({full_name:q.data.full_name??"",phone:q.data.phone??"",province:q.data.province??"",municipality:q.data.municipality??"",school_name:q.data.school_name??"",current_stage:q.data.current_stage??"prospective_student",highest_qualification:q.data.highest_qualification??"",interests:(q.data.interests??[]).join(", ")});},[q.data]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setSaving(true);
    const {error}=await supabase.from("user_profiles").update({
      full_name:form.full_name.trim(),phone:form.phone.trim()||null,province:form.province.trim()||null,
      municipality:form.municipality.trim()||null,school_name:form.school_name.trim()||null,current_stage:form.current_stage,
      highest_qualification:form.highest_qualification.trim()||null,
      interests:form.interests.split(",").map((x)=>x.trim()).filter(Boolean).slice(0,20),
      onboarding_completed:true,last_seen_at:new Date().toISOString(),
    }).eq("id",user.id);
    setSaving(false);if(error){toast.error(errorMessage(error));return;}toast.success("Profile updated");await qc.invalidateQueries({queryKey:["portal"]});
  }
  const set=(key:keyof typeof form,value:string)=>setForm((s)=>({...s,[key]:value}));

  return <section><div><h1 className="text-2xl font-bold text-primary">My profile</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Keep your details current so TECH-UP staff have the right context when helping you.</p></div>
    {q.isError&&<p className="mt-5 text-sm text-destructive">{errorMessage(q.error)}</p>}
    {q.isLoading?<p className="mt-6 text-sm text-muted-foreground">Loading profile…</p>:<form onSubmit={(e)=>void submit(e)} className="mt-6 grid max-w-3xl gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" value={user.email??""} disabled /><p className="text-xs text-muted-foreground">Your sign-in email is managed through your account.</p></div>
      <div className="space-y-2"><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" required value={form.full_name} onChange={(e)=>set("full_name",e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" value={form.phone} onChange={(e)=>set("phone",e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="profile-stage">Current stage</Label><select id="profile-stage" value={form.current_stage} onChange={(e)=>set("current_stage",e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{STAGES.map((s)=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="profile-qualification">Highest qualification</Label><Input id="profile-qualification" value={form.highest_qualification} onChange={(e)=>set("highest_qualification",e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="profile-province">Province</Label><Input id="profile-province" value={form.province} onChange={(e)=>set("province",e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="profile-municipality">Municipality / area</Label><Input id="profile-municipality" value={form.municipality} onChange={(e)=>set("municipality",e.target.value)} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-school">School / institution</Label><Input id="profile-school" value={form.school_name} onChange={(e)=>set("school_name",e.target.value)} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-interests">Interests</Label><Input id="profile-interests" value={form.interests} onChange={(e)=>set("interests",e.target.value)} placeholder="e.g. ICT, business, engineering, digital skills" /><p className="text-xs text-muted-foreground">Separate interests with commas.</p></div>
      <div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving?"Saving…":"Save profile"}</Button></div>
    </form>}
  </section>;
}
