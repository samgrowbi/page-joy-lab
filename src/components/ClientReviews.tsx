import { Star } from "lucide-react";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTreatment } from "@/context/TreatmentContext";

const defaultReviews = [
  {
    id: 1,
    name: "Isabella Rodriguez",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    timeAgo: "MAY 15, 2026",
    rating: 5,
    review: "Ok so I almost didn't book because I've been burned before by fancy places that overpromise. But my sister dragged me here and WOW. My skin literally looks like I got a filter installed on my face?? Already booked my next one lol."
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    timeAgo: "MAY 20, 2026",
    rating: 5,
    review: "I'm not exaggerating when I say my husband did a double take when I got home. He thought I got filler or something. Nope, just the LED facial! My pores are smaller and my skin just looks... alive again. 10/10."
  },
  {
    id: 3,
    name: "Gabriela Santos",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    timeAgo: "MAY 5, 2026",
    rating: 5,
    review: "I was SO nervous going in because I have super sensitive skin and everything breaks me out. They actually listened to my concerns and customized everything. No redness, no irritation, just glow. I literally cried happy tears in my car after."
  },
  {
    id: 4,
    name: "Amanda Rose",
    image: "https://randomuser.me/api/portraits/women/85.jpg",
    timeAgo: "MAY 22, 2026",
    rating: 5,
    review: "Three sessions in and my coworkers keep asking if I changed my skincare routine. I just smile and say 'something like that' 😂 The dark spots on my cheeks are fading and I've stopped wearing foundation on weekdays. That's huge for me."
  },
  {
    id: 5,
    name: "Carolina Herrera",
    image: "https://randomuser.me/api/portraits/women/91.jpg",
    timeAgo: "MAY 18, 2026",
    rating: 5,
    review: "As a mom of 3 I never do anything for myself. This was my first 'me thing' in years and I ugly-cried on the way home because I forgot what it felt like to feel pretty. Already told all my mom friends. We're making it a monthly thing."
  },
  {
    id: 6,
    name: "Rachel Johnson",
    image: "https://randomuser.me/api/portraits/women/26.jpg",
    timeAgo: "MAY 10, 2026",
    rating: 5,
    review: "I've spent thousands on serums and creams over the years. One session here did more than all of that combined. I'm not even being dramatic. My texture is smoother and the fine lines around my eyes are way less noticeable."
  },
  {
    id: 7,
    name: "Valentina Cruz",
    image: "https://randomuser.me/api/portraits/women/17.jpg",
    timeAgo: "MAY 25, 2026",
    rating: 5,
    review: "Came in for the pigmentation on my forehead that I've been self-conscious about for YEARS. After 4 sessions it's like 80% gone. I took a bare-face selfie for the first time in forever. This place changed my confidence honestly."
  },
  {
    id: 8,
    name: "Diana Miller",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    timeAgo: "MAY 12, 2026",
    rating: 5,
    review: "The girl at the front desk remembered my name on my second visit. Small thing but it made me feel so welcome. Oh and my skin? GLOWING. My daughter said I look younger than her and I'm going to ride that high for at least a month 😂"
  },
  {
    id: 9,
    name: "Sofia Morales",
    image: "https://randomuser.me/api/portraits/women/79.jpg",
    timeAgo: "MAY 8, 2026",
    rating: 5,
    review: "Full transparency: I was the biggest skeptic. LED therapy sounded too good to be true. But here I am writing a 5-star review because my jawline looks tighter, my skin is clearer, and I went to brunch without makeup last Sunday. Enough said."
  },
];

export function ClientReviews() {
  const treatment = useTreatment();
  const reviews = treatment.clientReviews || defaultReviews;
  return (
    <section className="py-4 md:py-6 bg-pink-50/60 overflow-hidden" dir="ltr">
      <div className="container mx-auto px-5">

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
            <CarouselContent className="-ml-3">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="pl-3 basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 h-full shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                      <img 
                        src={review.image} 
                        alt={review.name}
                        loading="lazy"
                        className="w-11 h-11 lg:w-14 lg:h-14 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base lg:text-lg">{review.name}</h4>
                        <p className="text-xs lg:text-sm text-gray-500">{review.timeAgo}</p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex mb-3 lg:mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-600 text-sm lg:text-base leading-relaxed font-light line-clamp-5">"{review.review}"</p>
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
