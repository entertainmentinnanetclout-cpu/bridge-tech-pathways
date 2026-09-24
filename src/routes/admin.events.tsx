import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events | TECH-UP Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudManager
      table="events"
      title="Events"
      description="Workshops, info sessions and community events."
      orderBy={{ column: "starts_at", ascending: false }}
      statusField="status"
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "cancelled", "archived"], inList: true },
        { name: "summary", label: "Summary", type: "textarea", required: true },
        { name: "location", label: "Location", type: "text", inList: true },
        { name: "starts_at", label: "Starts", type: "datetime", inList: true },
        { name: "ends_at", label: "Ends", type: "datetime" },
        { name: "external_url", label: "Registration / info link", type: "url" },
      ]}
    />
  ),
});
