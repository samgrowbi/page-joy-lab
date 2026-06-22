import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Star } from "lucide-react";
import { motion } from "motion/react";
import Hls from "hls.js";
import { useTreatment } from "@/context/TreatmentContext";
import { AccentWord } from "./ui/AccentWord";

// Cloudflare Stream HLS base
const CF_STREAM_BASE = "https://customer-vgdtdepv6dn1f10z.cloudflarestream.com";
const cfHls = (id: string) => `${CF_STREAM_BASE}/${id}/manifest/video.m3u8`;
const cfThumb = (id: string) => `${CF_STREAM_BASE}/${id}/thumbnails/thumbnail.jpg?time=1s&height=800`;
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const defaultTestimonials = [
  {
    id: 1,
    name: "Lisa",
    video: cfHls("fef064ec5718e2807f7ac47850a56fd0"),
    poster: cfThumb("fef064ec5718e2807f7ac47850a56fd0"),
    text: "Amazing transformation. My skin has never looked better!"
  },
  {
    id: 2,
    name: "Michelle",
    video: cfHls("1eb32523c9cc5bb808007a8d80e69539"),
    poster: cfThumb("1eb32523c9cc5bb808007a8d80e69539"),
    text: "The treatment really works. I'm so happy with my results."
  },
  {
    id: 3,
    name: "Ashley",
    video: cfHls("65a2a13b3fdb943c87da8e072fbc4c32"),
    poster: cfThumb("65a2a13b3fdb943c87da8e072fbc4c32"),
    text: "Professional, relaxing, and effective. 5 stars."
  },
  {
    id: 4,
    name: "Laura",
    video: cfHls("98f57f762e7d137dcb08fd5e0c8461e6"),
    poster: cfThumb("98f57f762e7d137dcb08fd5e0c8461e6"),
    text: "I feel so confident and refreshed after every session."
  },
  {
    id: 5,
    name: "Brittany",
    video: cfHls("38092316579d1f959504cba9ea862e64"),
    poster: cfThumb("38092316579d1f959504cba9ea862e64"),
    text: "I love how refreshed I look. Highly recommend."
  },
  {
    id: 6,
    name: "April",
    video: cfHls("7882a175ecde29b50078377d4e618cfc"),
    poster: cfThumb("7882a175ecde29b50078377d4e618cfc"),
    text: "Incredible results. The glow is real!"
  },
  {
    id: 7,
    name: "Tamara",
    video: cfHls("0e6359a8e8307d05bef10b22c9037d82"),
    poster: cfThumb("0e6359a8e8307d05bef10b22c9037d82"),
    text: "Such a wonderful experience. My skin looks radiant!"
  },
];

interface TestimonialCardProps {
  item: { id: number; name: string; video: string; poster?: string; text: string };
  isPlaying: boolean;
  onPlay: (id: number) => void;
  onPause: () => void;
}

function TestimonialCard({ item, isPlaying, onPlay, onPause }: TestimonialCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Attach HLS source on first play to keep initial page weight low
  const ensureSource = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasLoaded) return;
    const isHls = item.video.endsWith(".m3u8");

    if (isHls) {
      // Native HLS (Safari, iOS)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = item.video;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(item.video);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else {
        video.src = item.video;
      }
    } else {
      video.src = item.video;
    }
    setHasLoaded(true);
  }, [item.video, hasLoaded]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      ensureSource();
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
  }, [isPlaying, ensureSource]);

  const togglePlay = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay(item.id);
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative group cursor-pointer overflow-hidden rounded-3xl aspect-[9/14] shadow-xl bg-gray-100"
        onClick={togglePlay}
      >
        {/* Poster image — Cloudflare Stream auto thumbnail (instant LCP, no video bytes) */}
        {!hasLoaded && item.poster && (
          <img
            src={item.poster}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <video
          ref={videoRef}
          poster={item.poster}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted
          preload="none"
          crossOrigin="anonymous"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-pink-500 ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-7 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-white text-lg lg:text-xl">{item.name}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          <p className="text-white/80 text-sm lg:text-base font-light">{item.text}</p>
        </div>
      </div>
    </div>
  );
}

export function Feedback() {
  const treatment = useTreatment();
  const testimonials = treatment.feedbackTestimonials || defaultTestimonials;
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const autoplayRef = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const handlePlay = useCallback((id: number) => {
    setPlayingId(id);
    autoplayRef.current.stop();
  }, []);

  const handlePause = useCallback(() => {
    setPlayingId(null);
    autoplayRef.current.play();
  }, []);

  return (
    <section className="py-4 md:py-6 bg-white" dir="ltr">
      <div className="container mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 leading-tight mb-4">
            They Booked. They Came. <AccentWord>They Glowed.</AccentWord>
          </h2>
        </motion.div>

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
            plugins={[autoplayRef.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {testimonials.map((item) => (
                <CarouselItem key={item.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/4">
                  <TestimonialCard
                    item={item}
                    isPlaying={playingId === item.id}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex -left-5 w-10 h-10 border-none bg-white shadow-lg hover:bg-pink-50 text-gray-800 hover:text-pink-500" />
            <CarouselNext className="hidden md:flex -right-5 w-10 h-10 border-none bg-white shadow-lg hover:bg-pink-50 text-gray-800 hover:text-pink-500" />
          </Carousel>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 h-2.5 bg-pink-500"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-pink-300"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
