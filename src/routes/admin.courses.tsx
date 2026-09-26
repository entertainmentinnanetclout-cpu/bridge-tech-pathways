import { createFileRoute } from "@tanstack/react-router";
import { CrudManager } from "@/components/admin/CrudManager";

export const Route=createFileRoute("/admin/courses")({
  head:()=>({meta:[{title:"Courses | TECH-UP Admin"},{name:"robots",content:"noindex, nofollow"}]}),
  component:CoursesAdmin,
});

function CoursesAdmin(){
  return <CrudManager
    table="courses"
    title="Courses"
    description="Publish and maintain TECH-UP learning opportunities shown in My TECH-UP."
    statusField="status"
    orderBy={{column:"created_at",ascending:false}}
    slugFrom="title"
    fields={[
      {name:"title",label:"Course title",type:"text",required:true,inList:true},
      {name:"slug",label:"Slug",type:"text",help:"Leave blank to generate from the title."},
      {name:"summary",label:"Summary",type:"textarea",inList:true},
      {name:"description",label:"Description",type:"textarea"},
      {name:"provider",label:"Provider",type:"text",required:true,inList:true},
      {name:"delivery_mode",label:"Delivery mode",type:"select",required:true,options:["in_person","online","hybrid"],inList:true},
      {name:"location",label:"Location",type:"text"},
      {name:"duration",label:"Duration",type:"text"},
      {name:"start_date",label:"Start date",type:"date",inList:true},
      {name:"end_date",label:"End date",type:"date"},
      {name:"capacity",label:"Capacity",type:"number"},
      {name:"image_url",label:"Image URL",type:"url"},
      {name:"external_url",label:"External information URL",type:"url"},
      {name:"application_required",label:"Application required",type:"boolean"},
      {name:"status",label:"Status",type:"select",required:true,options:["draft","published","closed","archived"],inList:true},
    ]}
  />;
}
