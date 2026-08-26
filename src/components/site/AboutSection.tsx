import aboutImage from "@/assets/about-pathway.jpg";
import { Reveal } from "@/components/site/Reveal";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
              Who we are
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              About TECH-UP
            </h2>
            <figure className="mt-8 border-l-2 border-brand-lime pl-5">
              <blockquote className="text-xl leading-snug font-semibold text-foreground sm:text-2xl">
                “Rural should never mean disconnected.”
              </blockquote>
            </figure>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border/70">
              <img
                src={aboutImage}
                alt="A rural road curving through green fields with faint digital connection lines alongside it"
                width={1200}
                height={900}
                loading="lazy"
                className="h-56 w-full object-cover sm:h-72 lg:h-80"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              TECH-UP Rural-Digital Empowerment NPC exists to help bridge digital and opportunity
              gaps affecting rural communities.
            </p>
            <p>
              As education, applications, communication, employment and essential services become
              increasingly digital, communities without the same level of access, information and
              technical support can be left behind.
            </p>
            <p>
              TECH-UP aims to help create practical bridges between people and these opportunities
              through digital support, education pathways, information access and community-focused
              initiatives.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
