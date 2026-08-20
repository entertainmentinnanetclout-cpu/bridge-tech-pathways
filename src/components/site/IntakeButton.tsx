import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { EXTERNAL_LINK_PROPS, INTAKE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

interface IntakeButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "onDark" | "outline";
  size?: "md" | "lg";
  withIcon?: boolean;
}

export function IntakeButton({
  children,
  className,
  variant = "solid",
  size = "md",
  withIcon = true,
}: IntakeButtonProps) {
  return (
    <a
      href={INTAKE_URL}
      {...EXTERNAL_LINK_PROPS}
      className={cn(
        "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300",
        size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-3 text-sm",
        variant === "solid" &&
          "brand-gradient text-primary-foreground shadow-soft hover:shadow-lift hover:brightness-[1.06]",
        variant === "onDark" &&
          "bg-brand-gold text-brand-ink shadow-soft hover:brightness-[1.06] hover:shadow-lift",
        variant === "outline" &&
          "border border-primary/25 bg-background text-primary hover:border-primary/50 hover:bg-secondary",
        className,
      )}
    >
      {children}
      {withIcon ? (
        <ArrowUpRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      ) : null}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
