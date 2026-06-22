import { Star } from "lucide-react";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTreatment } from "@/context/TreatmentContext";

const defaultReviews = [
  {
    id: 1,
    name: "Maria S.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    timeAgo: "3 DAYS AGO",
    rating: 5,
    review: "I almost cancelled my appointment but I am so glad I showed up. The results exceeded my expectations."
  },
  {
    id: 2,
    name: "Jennifer L.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    timeAgo: "1 WEEK AGO",
    rating: 5,
    review: "The consultation was thorough and the treatment was exactly what my skin needed. Highly recommend."
  },
  {
    id: 3,
    name: "Amanda R.",
    image: "https://randomuser.me/api/portraits/women/47.jpg",
    timeAgo: "5 DAYS AGO",
    rating: 5,
    review: "Professional from start to finish. I booked through a promotion and left feeling like a VIP client."
  },
  {
    id: 4,
    name: "Rachel K.",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
    timeAgo: "2 WEEKS AGO",
    rating: 5,
    review: "I was nervous about my first visit but the team made me feel so comfortable. Best decision I made!"
  },
  {
    id: 5,
    name: "Nicole T.",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    timeAgo: "YESTERDAY",
    rating: 5,
    review: "Worth every minute of my time. The personalized attention and results are unmatched."
  },
  {
    id: 6,
    name: "Diana M.",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    timeAgo: "6 DAYS AGO",
    rating: 5,
    review: "I rescheduled twice before finally showing up. So grateful I did - my skin has never looked better!"
  },
  {
    id: 7,
    name: "Sarah W.",
    image: "https://randomuser.me/api/portraits/women/71.jpg",
    timeAgo: "TODAY",
    rating: 5,
    review: "Almost didn't make it due to a busy schedule, but I'm so happy I prioritized myself. The treatment was life-changing!"
  },
  {
    id: 8,
    name: "Lisa H.",
    image: "https://randomuser.me/api/portraits/women/26.jpg",
    timeAgo: "4 DAYS AGO",
    rating: 5,
    review: "I had doubts about trying something new, but the team answered all my questions. Left with amazing results and a new skincare routine!"
  },
];

export function ThankYouTestimonials() {
  const treatment = useTreatment();
  const reviews = treatment.clientReviews || defaultReviews;

  return (
    <section id="thankyou-testimonials-v2" className="py-16 md:py-24 bg-gray-50 overflow-hidden" dir="ltr">
      <div className="container mx-auto px-5">
        {/* Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-serif text-center text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Clients Who Are Glad They Showed Up
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Many of our clients booked through a promotion. Here is what happened next.
        </motion.p>

        {/* Rating */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-900">4.9</span>
          <span className="text-gray-500">(200+ Reviews)</span>
        </motion.div>

        {/* Reviews Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
              direction: "ltr",
              dragFree: true,
              containScroll: "trimSnaps",
              duration: 30,
            }}
            plugins={[
              Autoplay({
                delay: 2000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 h-full shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={review.image} 
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover"
                       loading="lazy" decoding="async"/>
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.name}</h4>
                        <p className="text-xs text-gray-500">{review.timeAgo}</p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-600 text-sm leading-relaxed">"{review.review}"</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
