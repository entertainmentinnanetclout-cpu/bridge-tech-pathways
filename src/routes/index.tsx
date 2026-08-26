import { createFileRoute } from "@tanstack/react-router";

import { AboutSection } from "@/components/site/AboutSection";
import { CTASection } from "@/components/site/CTASection";
import { DigitalRuralStory } from "@/components/site/DigitalRuralStory";
import { DocumentChecklist } from "@/components/site/DocumentChecklist";
import { FAQ } from "@/components/site/FAQ";
import { FocusAreas } from "@/components/site/FocusAreas";
import { Hero } from "@/components/site/Hero";
import { ImpactPathway } from "@/components/site/ImpactPathway";
import { IntakeProcess } from "@/components/site/IntakeProcess";
import { IntroBand } from "@/components/site/IntroBand";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TertiarySupport } from "@/components/site/TertiarySupport";

const title = "TECH-UP | Rural-Digital Empowerment & Tertiary Support";
const description =
  "TECH-UP Rural-Digital Empowerment NPC helps bridge rural digital gaps through access, education pathways, tertiary readiness and opportunity support.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TECH-UP Rural-Digital Empowerment NPC",
          alternateName: "TECH-UP",
          description,
          slogan: "Bridging Rural Gaps Through Digital Opportunity",
          url: "/",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <IntroBand />
        <AboutSection />
        <FocusAreas />
        <TertiarySupport />
        <IntakeProcess />
        <DocumentChecklist />
        <DigitalRuralStory />
        <ImpactPathway />
        <FAQ />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
