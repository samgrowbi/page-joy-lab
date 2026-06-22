import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useTreatment } from "@/context/TreatmentContext";
import { Plus } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { AccentWord } from "./ui/AccentWord";
import { Events, track } from "@/lib/analytics";

export function FAQ() {
  const treatment = useTreatment();
  const faqs = treatment.faqs;
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="faq" className="py-4 md:py-8 lg:py-16 bg-gray-50" dir="ltr">
      <div ref={ref} className="container mx-auto px-5">
        <div className="text-center mb-6 lg:mb-12 reveal">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight">
            Frequently Asked <AccentWord>Questions</AccentWord>
          </h2>
          <p className="text-gray-700 text-base md:text-lg lg:text-xl font-light mt-3 lg:mt-5">
            If you can't find the answer to your question, just give us a call.
          </p>
        </div>

        <div className="max-w-3xl mx-auto reveal delay-1">
          <Accordion
            type="single"
            collapsible
            className="flex flex-col gap-3 lg:gap-4"
            onValueChange={(value) => {
              if (!value) return;
              const idx = parseInt(value.replace("item-", ""), 10);
              const faq = faqs[idx];
              if (faq) {
                track(Events.FaqOpened, {
                  treatment: treatment.slug,
                  question: faq.question,
                  index: idx,
                });
              }
            }}
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl border border-gray-100 px-5 lg:px-7 shadow-sm hover-lift data-[state=open]:shadow-md data-[state=open]:border-pink-200 [&>h3>button>svg.lucide-chevron-down]:hidden"
              >
                <AccordionTrigger className="group text-left font-serif text-base md:text-lg lg:text-2xl text-gray-900 hover:no-underline py-5 lg:py-6 gap-4 [&[data-state=open]_.faq-icon]:rotate-45 [&[data-state=open]_.faq-icon]:bg-pink-500 [&[data-state=open]_.faq-icon]:text-white">
                  <span className="flex-1">{faq.question}</span>
                  <span
                    aria-hidden
                    className="faq-icon flex-shrink-0 inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-pink-50 text-pink-500 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2} />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 font-light text-[15px] md:text-base lg:text-lg leading-relaxed pb-5 lg:pb-6 pr-12 lg:pr-14 text-left">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
