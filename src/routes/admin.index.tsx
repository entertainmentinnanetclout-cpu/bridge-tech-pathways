import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardCheck, HandHelping, Inbox, Radio, UserRound } from "lucide-react";

import { errorMessage, supabase } from "@/lib/supabase";
import { useRealtimeRefresh } from "@/lib/realtime";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview | TECH-UP Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Overview,
});

type Profile={id:string;full_name:string;email:string|null};
type Activity={id:string;kind:string;title:string;subtitle:string;created_at:string;href:string};

function Overview() {
  useRealtimeRefresh(["user_profiles","applications","courses","course_enrollments","assistance_requests","service_requests","contact_inquiries"],"admin");
  const q=useQuery({queryKey:["admin","overview"],queryFn:async()=>{
    const [users,apps,courses,help,services,inquiries,recentApps,recentHelp,recentEnrollments,recentServices,profiles,courseRows] = await Promise.all([
      supabase.from("user_profiles").select("*",{count:"exact",head:true}),
      supabase.from("applications").select("*",{count:"exact",head:true}).not("status","in","(closed,withdrawn,unsuccessful)"),
      supabase.from("courses").select("*",{count:"exact",head:true}).eq("status","published"),
      supabase.from("assistance_requests").select("*",{count:"exact",head:true}).not("status","in","(resolved,closed)"),
      supabase.from("service_requests").select("*",{count:"exact",head:true}).not("status","in","(completed,cancelled)"),
      supabase.from("contact_inquiries").select("*",{count:"exact",head:true}).eq("status","new"),
      supabase.from("applications").select("id,user_id,programme,status,created_at").order("created_at",{ascending:false}).limit(5),
      supabase.from("assistance_requests").select("id,user_id,subject,status,created_at").order("created_at",{ascending:false}).limit(5),
      supabase.from("course_enrollments").select("id,user_id,course_id,status,created_at").order("created_at",{ascending:false}).limit(5),
      supabase.from("service_requests").select("id,user_id,subject,status,created_at").order("created_at",{ascending:false}).limit(5),
      supabase.from("user_profiles").select("id,full_name,email").limit(1000),
      supabase.from("courses").select("id,title").limit(1000),
    ]);
    const results=[users,apps,courses,help,services,inquiries,recentApps,recentHelp,recentEnrollments,recentServices,profiles,courseRows];
    const failed=results.find((x)=>x.error);if(failed?.error)throw failed.error;
    const person=new Map(((profiles.data??[]) as Profile[]).map((p)=>[p.id,p]));
    const courseMap=new Map(((courseRows.data??[]) as {id:string;title:string}[]).map((c)=>[c.id,c.title]));
    const who=(id:string)=>person.get(id)?.full_name||person.get(id)?.email||"User";
    const activity:Activity[]=[
      ...((recentApps.data??[]) as {id:string;user_id:string;programme:string;status:string;created_at:string}[]).map((x)=>({id:"app-"+x.id,kind:"Application",title:x.programme,subtitle:who(x.user_id)+" · "+x.status.replaceAll("_"," "),created_at:x.created_at,href:"/admin/applications"})),
      ...((recentHelp.data??[]) as {id:string;user_id:string;subject:string;status:string;created_at:string}[]).map((x)=>({id:"help-"+x.id,kind:"Assistance",title:x.subject,subtitle:who(x.user_id)+" · "+x.status.replaceAll("_"," "),created_at:x.created_at,href:"/admin/assistance"})),
      ...((recentEnrollments.data??[]) as {id:string;user_id:string;course_id:string;status:string;created_at:string}[]).map((x)=>({id:"course-"+x.id,kind:"Course",title:courseMap.get(x.course_id)||"Course interest",subtitle:who(x.user_id)+" · "+x.status,created_at:x.created_at,href:"/admin/enrollments"})),
      ...((recentServices.data??[]) as {id:string;user_id:string;subject:string;status:string;created_at:string}[]).map((x)=>({id:"service-"+x.id,kind:"Service",title:x.subject,subtitle:who(x.user_id)+" · "+x.status.replaceAll("_"," "),created_at:x.created_at,href:"/admin/services"})),
    ].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,10);
    return {
      counts:{users:users.count??0,applications:apps.count??0,courses:courses.count??0,assistance:help.count??0,services:services.count??0,inquiries:inquiries.count??0},
      activity,
    };
  }});

  const cards=[
    {label:"Registered users",value:q.data?.counts.users,icon:UserRound,to:"/admin/users"},
    {label:"Active applications",value:q.data?.counts.applications,icon:ClipboardCheck,to:"/admin/applications"},
    {label:"Published courses",value:q.data?.counts.courses,icon:BookOpen,to:"/admin/courses"},
    {label:"Open assistance",value:q.data?.counts.assistance,icon:HandHelping,to:"/admin/assistance"},
    {label:"Open service requests",value:q.data?.counts.services,icon:Radio,to:"/admin/services"},
    {label:"New contact inquiries",value:q.data?.counts.inquiries,icon:Inbox,to:"/admin/inbox"},
  ];

  return <section>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-turquoise">Admin OS</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-primary">Operations overview</h1><p className="mt-2 text-sm text-muted-foreground">Live operational view across users, application support, courses, assistance, services and enquiries.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-brand-turquoise/30 bg-brand-turquoise/10 px-3 py-2 text-xs font-semibold text-primary"><Radio className="size-3.5" />Realtime connected</span></div>
    {q.isError&&<p className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{errorMessage(q.error)}</p>}
    <dl className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({label,value,icon:Icon,to})=><Link key={label} to={to} className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand-turquoise/40 hover:shadow-soft"><dt className="flex items-center justify-between text-sm text-muted-foreground"><span>{label}</span><Icon className="size-4 text-primary" /></dt><dd className="mt-3 text-3xl font-bold text-primary">{q.isLoading?"…":String(value??0)}</dd></Link>)}
    </dl>
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-primary">Live activity</h2><p className="mt-1 text-xs text-muted-foreground">Newest account workflow activity appears here automatically.</p></div><span className="inline-flex size-2 rounded-full bg-brand-lime" /></div><div className="mt-5 divide-y divide-border">{q.isLoading&&<p className="py-4 text-sm text-muted-foreground">Loading activity…</p>}{q.isSuccess&&q.data.activity.length===0&&<p className="py-4 text-sm text-muted-foreground">No account activity yet.</p>}{q.data?.activity.map((a)=><Link key={a.id} to={a.href} className="grid gap-1 py-4 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-4"><span className="text-xs font-semibold uppercase tracking-wide text-brand-turquoise">{a.kind}</span><span><span className="block text-sm font-semibold text-foreground">{a.title}</span><span className="block text-xs text-muted-foreground">{a.subtitle}</span></span><span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("en-ZA")}</span></Link>)}</div></div>
  </section>;
}
