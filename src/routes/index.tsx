import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/components/site/AboutSection";
import { CTASection } from "@/components/site/CTASection";
import { Contact } from "@/components/site/Contact";
import { DocumentChecklist } from "@/components/site/DocumentChecklist";
import { FAQ } from "@/components/site/FAQ";
import { FocusAreas } from "@/components/site/FocusAreas";
import { GetInvolved } from "@/components/site/GetInvolved";
import { Hero } from "@/components/site/Hero";
import { ImpactPathway } from "@/components/site/ImpactPathway";
import { IntakeProcess } from "@/components/site/IntakeProcess";
import { IntroBand } from "@/components/site/IntroBand";
import { Leadership } from "@/components/site/Leadership";
import { PublicAnnouncement } from "@/components/site/PublicAnnouncement";
import { PublicUpdates } from "@/components/site/PublicUpdates";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TertiarySupport } from "@/components/site/TertiarySupport";
import { WhyWeExist } from "@/components/site/WhyWeExist";
import { ORG } from "@/lib/site";
const title = "TECH-UP | Rural-Digital Empowerment & Tertiary Support";
const description = "TECH-UP Rural-Digital Empowerment NPC bridges the rural digital divide through tertiary admissions support, digital literacy and 4IR skills training in North West, South Africa.";
const siteUrl = `${ORG.websiteUrl.replace(/\/$/, "")}/`;
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title }, { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "Organization", name: ORG.name,
      alternateName: ORG.shortName, description, slogan: ORG.tagline,
      url: ORG.websiteUrl, email: ORG.email,
      address: { "@type": "PostalAddress", addressLocality: "Rustenburg", addressRegion: "North West", addressCountry: "ZA" },
      areaServed: { "@type": "AdministrativeArea", name: "Rustenburg Local Municipality, North West, South Africa" },
    }) }],
  }),
  component: Index,
});
function Index() {
  return <div className="min-h-dvh bg-background"><SiteHeader /><main>
    <PublicAnnouncement /><Hero /><IntroBand /><AboutSection /><WhyWeExist /><FocusAreas />
    <TertiarySupport /><IntakeProcess /><DocumentChecklist /><ImpactPathway />
    <PublicUpdates /><Leadership /><GetInvolved /><FAQ /><Contact /><CTASection />
  </main><SiteFooter /></div>;
}
