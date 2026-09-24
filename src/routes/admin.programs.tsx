import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({ meta: [{ title: "Programmes | TECH-UP Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudManager
      table="programs"
      title="Programmes"
      description="Programmes shown on the public website when published."
      orderBy={{ column: "sort_order", ascending: true }}
      statusField="status"
      slugFrom="title"
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"], inList: true },
        { name: "category", label: "Category", type: "text", inList: true },
        { name: "slug", label: "Slug", type: "text", help: "Leave blank to generate from the title." },
        { name: "summary", label: "Summary", type: "textarea", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image_url", label: "Image URL", type: "url" },
        { name: "external_url", label: "External link", type: "url" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
