import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/techup-logo.png.asset.json";
import { IntakeButton } from "@/components/site/IntakeButton";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border/80 bg-background/90 backdrop-blur-md"
          : "border-transparent bg-background/70 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex shrink-0 items-center" aria-label="TECH-UP home">
          <img
            src={logo.url}
            alt="TECH-UP Digital-Rural Empowerment NPC logo"
            width={428}
            height={420}
            className="h-11 w-auto object-contain sm:h-12"
          />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <IntakeButton className="hidden sm:inline-flex">Start Tertiary Intake</IntakeButton>

          <Sheet>
            <SheetTrigger
              aria-label="Open navigation menu"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-secondary lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm">
              <SheetTitle className="sr-only">TECH-UP navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <img
                  src={logo.url}
                  alt="TECH-UP Digital-Rural Empowerment NPC logo"
                  width={428}
                  height={420}
                  className="h-12 w-auto self-start object-contain"
                />
                <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-8">
                  <IntakeButton size="lg" className="w-full">
                    Start Tertiary Intake
                  </IntakeButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
