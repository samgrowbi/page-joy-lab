import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export function ExpertOpinion() {
  const experts = [
    {
      id: 1,
      name: "Dr. P. Panyova",
      title: "DERMATOLOGIST & CONTOUR PLASTIC SPECIALIST",
      quote: "This Skin Tightening Treatment tackles wrinkles, enlarged pores, pigmentation, and a wide range of skin concerns dramatically improving skin health, texture, and firmness.",
      image: "https://growbi.b-cdn.net/website%20images/68d273e2381c95a8ad4d09e7_Polina%20image.png"
    },
    {
      id: 4,
      name: "Professor George Smoot",
      title: "DIRECTOR, AMERICAN ASTROPHYSICIST AND COSMOLOGIST, BERKELEY PROFESSOR & NOBEL LAUREATE",
      quote: "This advanced non-surgical skin rejuvenation treatment is fast, safe, and remarkably effective delivering visible results in minutes with absolutely no downtime.",
      image: "https://Growbi.b-cdn.net/website%20images/6904990fe748fb2b8f2beb00_67ea77b3c5006416503e0922_Professor20Smoot%2520(1).png"
    },
    {
      id: 5,
      name: "Professor Philippe A Liverneaux",
      title: "Chair of Plastic Surgery Department - Strasbourg University France",
      quote: "I strongly encourage fellow doctors and plastic surgeons to recommend this treatment as a first-line solution before considering surgical options.",
      image: "https://Growbi.b-cdn.net/website%20images/philippe.png"
    },
  ];

  return (
    <section className="py-10 md:py-16 bg-gray-100 overflow-hidden" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-normal text-gray-900 leading-tight mb-6">
            What the <span className="text-pink-500">Experts</span> Say
          </h2>
          <p className="text-gray-500 text-lg font-light">
            Leading dermatologists and medical professionals recommend our treatments
          </p>
        </div>

        <div className="relative px-0 md:px-16">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {experts.map((expert) => (
                <CarouselItem key={expert.id} className="basis-full">
                  <div className="flex justify-center px-1 md:px-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-12 shadow-sm max-w-4xl w-full">
                      <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Left: Quote & Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 font-light text-justify">
                            <span className="text-pink-400 text-xl align-text-top leading-none mr-1">"</span>{expert.quote}<span className="text-pink-400 text-xl align-text-top leading-none ml-1">"</span>
                          </p>

                          {/* Name & Title */}
                          <p className="font-bold text-gray-900 text-xl md:text-2xl mb-1">{expert.name}</p>
                          <p className="text-xs text-pink-500 uppercase tracking-wider font-medium leading-tight">{expert.title}</p>
                        </div>

                        {/* Right: Image */}
                        <div className="w-[50%] mx-auto md:w-40 lg:w-48 shrink-0">
                          <div className="w-full aspect-square rounded-full overflow-hidden ring-4 ring-pink-300 ring-offset-2">
                            <img
                              src={expert.image}
                              alt={expert.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex -left-4 w-12 h-12 border border-pink-300 bg-white shadow-lg hover:bg-pink-50 text-gray-800 hover:text-pink-500 rounded-full" />
            <CarouselNext className="hidden md:flex -right-4 w-12 h-12 border-none bg-white shadow-lg hover:bg-pink-50 text-gray-800 hover:text-pink-500 rounded-full" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}