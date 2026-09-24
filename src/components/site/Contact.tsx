import { Building2, Globe, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { IntakeButton } from "@/components/site/IntakeButton";
import { Reveal } from "@/components/site/Reveal";
import { EXTERNAL_LINK_PROPS, ORG } from "@/lib/site";
export function Contact() {
  return <section id="contact" className="scroll-mt-24 bg-background"><div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <Reveal><p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">Contact</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Get in Touch</h2><p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">For enquiries about our programmes, partnerships, volunteering or our commercial services, contact us and we will respond as soon as we can.</p><div className="mt-8"><IntakeButton size="lg">Start Tertiary Intake</IntakeButton></div></Reveal>
      <Reveal delay={100} as="dl" className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card p-6"><dt className="flex items-center gap-2 text-sm font-semibold text-primary"><Mail className="size-4" aria-hidden="true" /> Email</dt><dd className="mt-2 text-sm break-all text-muted-foreground"><a href={`mailto:${ORG.email}`} className="transition-colors hover:text-primary">{ORG.email}</a></dd></div>
        <div className="rounded-2xl border border-border/80 bg-card p-6"><dt className="flex items-center gap-2 text-sm font-semibold text-primary"><Globe className="size-4" aria-hidden="true" /> Official portal</dt><dd className="mt-2 text-sm break-all text-muted-foreground"><a href={ORG.websiteUrl} {...EXTERNAL_LINK_PROPS} className="transition-colors hover:text-primary">{ORG.websiteLabel}</a></dd></div>
        <div className="rounded-2xl border border-border/80 bg-card p-6"><dt className="flex items-center gap-2 text-sm font-semibold text-primary"><MapPin className="size-4" aria-hidden="true" /> Location</dt><dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{ORG.location}</dd></div>
        <div className="rounded-2xl border border-border/80 bg-card p-6"><dt className="flex items-center gap-2 text-sm font-semibold text-primary"><Building2 className="size-4" aria-hidden="true" /> Registration</dt><dd className="mt-2 text-sm leading-relaxed text-muted-foreground">CIPC {ORG.registrationNumber}<br />{ORG.status}</dd></div>
      </Reveal>
    </div>
    <ContactForm />
  </div></section>;
}
