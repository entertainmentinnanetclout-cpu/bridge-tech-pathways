import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, MapPin } from "lucide-react";

import { usePortalUser } from "@/components/portal/UserContext";
import { Button } from "@/components/ui/button";
import { errorMessage, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

type Course={id:string;title:string;summary:string;description:string;provider:string;delivery_mode:string;location:string|null;duration:string|null;start_date:string|null;end_date:string|null;capacity:number|null;external_url:string|null;application_required:boolean};
type Enrollment={id:string;course_id:string;status:string;created_at:string;updated_at:string};

export const Route=createFileRoute("/portal/courses")({
  head:()=>({meta:[{title:"Courses | My TECH-UP"},{name:"robots",content:"noindex, nofollow"}]}),
  component:CoursesPage,
});

function CoursesPage(){
  const {user}=usePortalUser();
  const qc=useQueryClient();
  useRealtimeRefresh(["courses","course_enrollments","notifications"],"portal");
  const q=useQuery({queryKey:["portal","courses",user.id],queryFn:async()=>{
    const [courses,enrol]=await Promise.all([
      supabase.from("courses").select("id,title,summary,description,provider,delivery_mode,location,duration,start_date,end_date,capacity,external_url,application_required").eq("status","published").order("start_date",{ascending:true,nullsFirst:false}),
      supabase.from("course_enrollments").select("id,course_id,status,created_at,updated_at").eq("user_id",user.id),
    ]);
    if(courses.error) throw courses.error;if(enrol.error) throw enrol.error;
    return {courses:(courses.data??[]) as Course[],enrollments:(enrol.data??[]) as Enrollment[]};
  }});

  async function register(courseId:string){
    const {error}=await supabase.from("course_enrollments").insert({course_id:courseId,user_id:user.id,status:"interested"});
    if(error){toast.error(error.code==="23505"?"You already registered interest in this course.":errorMessage(error));return;}
    toast.success("Course interest registered");await qc.invalidateQueries({queryKey:["portal"]});
  }
  const enrolMap=new Map((q.data?.enrollments??[]).map((e)=>[e.course_id,e]));

  return <section><div><h1 className="text-2xl font-bold text-primary">Courses</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Browse TECH-UP learning opportunities and register your interest from your account.</p></div>
    {q.isError && <p className="mt-5 text-sm text-destructive">{errorMessage(q.error)}</p>}
    <div className="mt-7 grid gap-5 lg:grid-cols-2">
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading courses…</p>}
      {q.isSuccess && q.data.courses.length===0 && <div className="rounded-2xl border border-border bg-card p-6"><p className="font-semibold text-primary">No published courses yet</p><p className="mt-2 text-sm text-muted-foreground">New courses will appear here as soon as TECH-UP publishes them.</p></div>}
      {q.data?.courses.map((c)=>{
        const enrol=enrolMap.get(c.id);
        return <article key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-turquoise">{c.delivery_mode.replaceAll("_"," ")}</p><h2 className="mt-2 text-xl font-semibold text-foreground">{c.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.summary||c.description}</p></div>{enrol && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-primary">{enrol.status}</span>}</div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">{c.start_date&&<span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />Starts {new Date(c.start_date).toLocaleDateString("en-ZA")}</span>}{c.location&&<span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{c.location}</span>}{c.duration&&<span>{c.duration}</span>}</div>
          <div className="mt-auto flex flex-wrap gap-3 pt-6">{enrol?<Button variant="outline" disabled>Interest registered</Button>:<Button onClick={()=>void register(c.id)}>I'm interested</Button>}{c.external_url&&<a href={c.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-secondary">Course information</a>}</div>
        </article>;
      })}
    </div>
  </section>;
}
