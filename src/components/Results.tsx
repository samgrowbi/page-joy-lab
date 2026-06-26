import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { BeforeAfterCard } from "./BeforeAfterCard";
import { useTreatment } from "@/context/TreatmentContext";
import { AccentWord } from "./ui/AccentWord";
import faceBa9 from "@/assets/face-ba-9.webp";
import faceBa11 from "@/assets/face-ba-11.webp";
import faceBa19 from "@/assets/face-ba-19.webp";
import faceBa28 from "@/assets/face-ba-28.webp";
import faceBa28b from "@/assets/face-ba-28b.webp";
import faceBa40 from "@/assets/face-ba-40.webp";
const R2_BASE = "https://pub-eb17aaa123fc4145b1ee4c15fc2e5771.r2.dev/Med%20Spa/Before%20After";

const defaultResults = [
  { id: 2, before: `${R2_BASE}/a2-before.png`, after: `${R2_BASE}/a2-after.png`, label: "Wrinkle Reduction", name: "Sarah", age: 52 },
  { id: 3, before: `${R2_BASE}/a3-before.png`, after: `${R2_BASE}/a3-after.png`, label: "Facial Lifting", name: "Maria", age: 61 },
  { id: 4, before: `${R2_BASE}/a4-before.png`, after: `${R2_BASE}/a4-after.png`, label: "Skin Rejuvenation", name: "Jennifer", age: 55 },
  { id: 5, before: `${R2_BASE}/a5-after.png`, after: `${R2_BASE}/a5-before.png`, label: "Pigmentation", name: "Laura", age: 58 },
  { id: 6, before: `${R2_BASE}/a6-after.png`, after: `${R2_BASE}/a6-before.png`, label: "Skin Tightening", name: "Rachel", age: 68 },
  { id: 7, before: `${R2_BASE}/a7-before.png`, after: `${R2_BASE}/a7-after.png`, label: "Neck Rejuvenation", name: "Diana", age: 58 },
  { id: 8, before: `${R2_BASE}/a8-before.jpg`, after: `${R2_BASE}/a8-after.jpg`, label: "Forehead Pigmentation", name: "Amanda", age: 44 },
  { id: 9, before: `${R2_BASE}/a9-before.jpg`, after: `${R2_BASE}/a9-after.jpg`, label: "Chest Rejuvenation", name: "Nicole", age: 51 },
  { id: 101, composite: faceBa9,   label: "Facial Rejuvenation", name: "Vanessa", age: 49 },
  { id: 102, composite: faceBa11,  label: "Skin Lifting", name: "Catherine", age: 54 },
  { id: 103, composite: faceBa19,  label: "Wrinkle Smoothing", name: "Margaret", age: 57 },
  { id: 104, composite: faceBa28,  label: "Skin Tone & Texture", name: "Elaine", age: 62 },
  { id: 105, composite: faceBa28b, label: "Facial Contouring", name: "Rosalind", age: 63 },
  { id: 106, composite: faceBa40,  label: "Glow & Radiance", name: "Brianna", age: 34 },

];

export function Results() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const treatment = useTreatment();

  const treatmentResults = treatment.beforeAfterResults;
  const results = treatmentResults || defaultResults;
  const isComposite = results.some((r: any) => r.composite);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrentIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const scrollTo = (index: number) => api?.scrollTo(index);

  return (
    <section id="results" className="pt-4 md:pt-6 pb-6 md:pb-10 bg-white relative overflow-hidden" dir="ltr">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-pink-50/50 rounded-full blur-3xl -z-10 pointer-events-none opacity-60" />

      <div className="container mx-auto px-5 pt-0 md:pt-0">
        <div className="text-center mb-8 lg:mb-12 space-y-1 lg:space-y-2">
          <p className="text-[18px] lg:text-base uppercase tracking-[0.2em] text-gray-400 font-bold">No Filters</p>
          <h2 className="hidden sm:block text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight">
            <span className="text-gray-900">Real People.</span> <AccentWord>Real Results.</AccentWord>
          </h2>
          <div className="flex justify-center pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs lg:text-sm font-medium text-green-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Photos
            </span>
          </div>
        </div>

        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
              containScroll: "trimSnaps",
              duration: 40,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full mx-auto"
          >
            <CarouselContent className="-ml-6">
              {results.map((item) => (
                <CarouselItem key={item.id} className="basis-[85%] md:basis-1/2 pl-6">
                  {isComposite && 'composite' in item && item.composite ? (
                    <div className="group" dir="ltr">
                      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-white transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-1">
                        <div className="w-full aspect-[4/3] lg:aspect-[3/2] overflow-hidden bg-gray-100">
                          <img
                            src={item.composite}
                            alt={item.label}
                            loading="lazy"
                            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                          />
                        </div>
                        {('name' in item && item.name) && (
                          <div className="w-full text-center py-2 lg:py-3 bg-white">
                            <span className="text-sm lg:text-lg xl:text-xl font-medium text-gray-800">{item.name}</span>
                            {('age' in item && item.age) && <span className="text-sm lg:text-lg xl:text-xl text-gray-500">, {item.age}</span>}
                          </div>
                        )}
                        <div className="flex w-full text-center text-sm lg:text-base font-medium tracking-wide uppercase">
                          <div className="w-1/2 py-2.5 lg:py-3.5 bg-gray-100 text-gray-500 border-r border-white transition-colors duration-300 group-hover:bg-gray-200">
                            Before
                          </div>
                          <div className="w-1/2 py-2.5 lg:py-3.5 bg-pink-500 text-white shadow-inner transition-colors duration-300 group-hover:bg-pink-600">
                            After
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (

                    <BeforeAfterCard
                      beforeImg={'before' in item ? item.before || '' : ''}
                      afterImg={'after' in item ? item.after || '' : ''}
                      label={item.label}
                      name={'name' in item ? (item as any).name : undefined}
                      age={'age' in item ? (item as any).age : undefined}
                    />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex -left-12 w-12 h-12 border-none bg-white shadow-lg hover:bg-pink-50 text-gray-800 hover:text-pink-500" />
            <CarouselNext className="hidden md:flex -right-12 w-12 h-12 border-none bg-white shadow-lg hover:bg-pink-50 text-gray-800 hover:text-pink-500" />
          </Carousel>

          <div className="flex justify-center items-center gap-2 mt-6">
            {results.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-pink-500 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <p className="hidden sm:block text-center text-gray-900 text-xs lg:text-base xl:text-lg mt-4 lg:mt-6">
            Every result shown is from a real client. Individual results may vary.
          </p>
        </div>
      </div>
    </section>
  );
}
