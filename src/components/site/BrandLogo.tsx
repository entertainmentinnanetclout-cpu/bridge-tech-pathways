import { cn } from "@/lib/utils";

/** The earlier .asset.json pointed to an image proxy only available in the old preview.
 * The icon below is a real public/ repository file, served by every deployment. */
export function BrandLogo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
    <img src="/favicon.png" alt="" width={56} height={56} className={compact ? "size-9 shrink-0 object-contain" : "size-11 shrink-0 object-contain"} />
    <span className="min-w-0"><span className={cn("block font-extrabold tracking-tight text-primary", compact ? "text-lg" : "text-xl")}>TECH-UP</span>{!compact && <span className="block text-[9px] font-semibold tracking-wide text-brand-turquoise">Digital-Rural Empowerment NPC</span>}</span>
  </span>;
}
