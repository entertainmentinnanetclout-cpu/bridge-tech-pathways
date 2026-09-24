import keamogetswe from "@/assets/keamogetswe-soma.jpg.asset.json";
import kgatoentle from "@/assets/kgatoentle-chimoya.jpg.asset.json";
import { Reveal } from "@/components/site/Reveal";
const directors = [
  { name: "Onalenna Innocent Molathlekgi", title: "Founder", image: "/techup-founder.jpg" },
  { name: "Keamogetswe Soma", title: "Director", image: keamogetswe.url },
  { name: "Kgatoentle Chimoya", title: "Director", image: kgatoentle.url },
];
export function Leadership() {
  return <section id="leadership" className="scroll-mt-24 bg-surface"><div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
    <Reveal className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">Leadership</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Our Leadership</h2><p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">Meet the people behind TECH-UP Digital-Rural Empowerment NPC.</p></Reveal>
    <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{directors.map((person, index) => <Reveal as="li" key={person.name} delay={index * 80} className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="aspect-4/5 w-full overflow-hidden bg-secondary"><img src={person.image} alt={`${person.name}, ${person.title} of TECH-UP`} loading="lazy" width="400" height="500" className="h-full w-full object-cover object-top" /></div>
      <div className="p-6"><p className="text-base font-semibold text-foreground">{person.name}</p><p className="mt-1 text-sm text-muted-foreground">{person.title}</p></div>
    </Reveal>)}</ul>
  </div></section>;
}
