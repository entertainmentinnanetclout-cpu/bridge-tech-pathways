import { createFileRoute } from "@tanstack/react-router";

import { CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "Content | TECH-UP Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <CrudManager
      table="content_sections"
      title="Content sections"
      description="Published sections appear in the “News & notices” area of the homepage."
      orderBy={{ column: "sort_order", ascending: true }}
      slugFrom="heading"
      fields={[
        { name: "heading", label: "Heading", type: "text", required: true },
        { name: "is_published", label: "Published", type: "boolean", inList: true },
        { name: "slug", label: "Slug", type: "text", inList: true, help: "Leave blank to generate from the heading." },
        { name: "body", label: "Body", type: "textarea" },
        { name: "data", label: "Extra data (JSON)", type: "json", help: "Optional, e.g. {\"link\": \"https://…\", \"link_label\": \"Read more\"}" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  ),
});
