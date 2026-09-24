import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";

// The two director image pointers previously used the /__l5e preview-only proxy;
// the original portraits are not in this GitHub repository. Do not substitute
// someone else's photo. A branded initials fallback is shown until the originals
// are uploaded into public/ and their paths are added here.
const leaders = [
  { name: "Onalenna Innocent Molathlekgi", title: "Founder", image: "/techup-founder.jpg" },
  { name: "Keamogetswe Soma", title: "Director", image: null },
  { name: "Kgatoentle Chimoya", title: "Director", image: null },
];
function Portrait({ name, image }: { name: string; image: string | null }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").map((word) => word.charAt(0)).slice(0, 2).join("");
  return <div className="aspect-4/5 w-full overflow-hidden bg-secondary">
    {image && !failed ? <img src={image} alt={`Portrait of ${name}`} loading="lazy" width={400} height={500} onError={() => setFailed(true)} className="h-full w-full object-cover object-top" /> : <div aria-label={`Photo of ${name} not yet available`} className="brand-gradient flex h-full w-full items-center justify-center"><span aria-hidden="true" className="text-5xl font-bold tracking-tight text-primary-foreground">{initials}</span></div>}
  </div>;
}
export function Leadership() {
  return <section id="leadership" className="scroll-mt-24 bg-surface"><div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8"><Reveal className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">Leadership</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Our Leadership</h2><p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">Meet the people behind TECH-UP Digital-Rural Empowerment NPC.</p></Reveal><ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{leaders.map((person, index) => <Reveal as="li" key={person.name} delay={index * 80} className="overflow-hidden rounded-2xl border border-border/80 bg-card"><Portrait name={person.name} image={person.image} /><div className="p-6"><p className="text-base font-semibold text-foreground">{person.name}</p><p className="mt-1 text-sm text-muted-foreground">{person.title}</p></div></Reveal>)}</ul></div></section>;
}
