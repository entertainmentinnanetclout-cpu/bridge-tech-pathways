import { Megaphone } from "lucide-react";
import { usePublicSetting } from "@/lib/publicSettings";

export function PublicAnnouncement() {
  const announcement = usePublicSetting("announcement");
  if (!announcement) return null;
  return (
    <div role="status" className="border-b border-primary/15 bg-secondary px-4 py-3 text-primary">
      <div className="mx-auto flex max-w-7xl items-start gap-3 text-sm sm:px-2">
        <Megaphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 whitespace-pre-wrap break-words">{announcement}</p>
      </div>
    </div>
  );
}
