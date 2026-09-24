import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/opportunities")({
  head: () => ({ meta: [{ title: "Opportunities | TECH-UP Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudManager
      table="opportunities"
      title="Opportunities"
      description="Bursaries, learnerships, jobs and other opportunities."
      orderBy={{ column: "created_at", ascending: false }}
      statusField="status"
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "closed", "archived"], inList: true },
        { name: "type", label: "Type", type: "text", required: true, inList: true, help: "e.g. Bursary, Learnership, Job" },
        { name: "summary", label: "Summary", type: "textarea", required: true },
        { name: "location", label: "Location", type: "text", inList: true },
        { name: "closing_date", label: "Closing date", type: "date", inList: true },
        { name: "external_url", label: "Apply / info link", type: "url" },
      ]}
    />
  ),
});
