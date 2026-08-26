import { IntakeButton } from "@/components/site/IntakeButton";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is TECH-UP?",
    answer:
      "TECH-UP Rural-Digital Empowerment NPC is focused on using digital access, information and opportunity pathways to support rural empowerment.",
  },
  {
    question: "What is the TECH-UP Tertiary Intake?",
    answer:
      "It is an intake process used to collect relevant applicant information, academic status, tertiary preferences and supporting documentation.",
  },
  {
    question: "Does completing the intake guarantee university or college admission?",
    answer:
      "No. Admission decisions remain with the relevant university, TVET college or other institution.",
  },
  {
    question: "What documents should I prepare?",
    answer:
      "Applicants should preferably have a certified ID or passport copy, latest academic results or Matric certificate, proof of residential address and next-of-kin ID documentation available.",
  },
  {
    question: "Where do I complete the intake?",
    answer: "Through TECH-UP's official Tertiary Intake form.",
    cta: true,
  },
  {
    question: "Is this an institutional application form?",
    answer:
      "No. TECH-UP's intake should not be represented as replacing the official admission processes of universities, TVET colleges or other institutions.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 bg-surface">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold tracking-[0.22em] text-brand-turquoise uppercase">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </Reveal>

        <Reveal delay={80} className="mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="py-5 text-base font-semibold text-foreground hover:no-underline sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  <p>{faq.answer}</p>
                  {faq.cta ? (
                    <div className="mt-4">
                      <IntakeButton variant="outline">Open Intake Form</IntakeButton>
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
