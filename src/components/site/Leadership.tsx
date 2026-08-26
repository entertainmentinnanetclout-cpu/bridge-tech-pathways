import keamogetswe from "@/assets/keamogetswe-soma.jpg.asset.json";
import kgatoentle from "@/assets/kgatoentle-chimoya.jpg.asset.json";
import { Reveal } from "@/components/site/Reveal";

const directors = [
  { name: "Onnalenna Molothlekgi", image: null },
  { name: "Keamogetswe Soma", image: keamogetswe.url },
  { name: "Kgatoentle Chimoya", image: kgatoentle.url },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Leadership() {
  return (
    <section id="leadership" className="scroll-mt-24 bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
            Leadership
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Our Directors
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            TECH-UP is directed by a team rooted in the communities we serve.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {directors.map((director, index) => (
            <Reveal
              as="li"
              key={director.name}
              delay={index * 80}
              className="overflow-hidden rounded-2xl border border-border/80 bg-card"
            >
              <div className="aspect-4/5 w-full overflow-hidden bg-secondary">
                {director.image ? (
                  <img
                    src={director.image}
                    alt={`Portrait of ${director.name}, director of TECH-UP Rural-Digital Empowerment NPC`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div
                    className="brand-gradient flex h-full w-full items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-4xl font-bold tracking-tight text-primary-foreground">
                      {initials(director.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="text-base font-semibold text-foreground">{director.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">Director</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
