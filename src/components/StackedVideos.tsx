import { useState, useRef } from "react";
import { motion } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";

const videos = [
  { id: 1, url: "https://Growbi.b-cdn.net/Lovable/V1.mp4" },
  { id: 2, url: "https://Growbi.b-cdn.net/Lovable/V4.mp4" },
  { id: 3, url: "https://Growbi.b-cdn.net/Lovable/V5.mp4" },
  { id: 4, url: "https://Growbi.b-cdn.net/Lovable/V7.mp4" },
  { id: 5, url: "https://Growbi.b-cdn.net/Lovable/Video%202.mp4" },
  { id: 6, url: "https://Growbi.b-cdn.net/Lovable/V1.mp4" },
  { id: 7, url: "https://Growbi.b-cdn.net/Lovable/V4.mp4" },
];

// Configuration for each video position in the spread
const getVideoStyles = (
  index: number,
  totalVisible: number,
  isMobile: boolean,
  activeIndex: number | null
) => {
  const centerIndex = Math.floor(totalVisible / 2);

  // If this video is active, center it
  if (activeIndex === index) {
    return {
      scale: 1.05,
      zIndex: totalVisible + 1,
      translateX: 0,
      translateY: 0,
    };
  }

  // If another video is active, adjust positions relative to active
  if (activeIndex !== null) {
    const distanceFromActive = index - activeIndex;
    const absDistance = Math.abs(distanceFromActive);

    return {
      scale: 0.85 - absDistance * 0.05,
      zIndex: totalVisible - absDistance,
      translateX: distanceFromActive * (isMobile ? 120 : 220),
      translateY: absDistance * 12,
    };
  }

  // Default spread behavior
  const distanceFromCenter = index - centerIndex;
  const absDistance = Math.abs(distanceFromCenter);

  // Scale decreases as we move away from center
  const scale = 1 - absDistance * 0.12;

  // Z-index is highest at center
  const zIndex = totalVisible - absDistance;

  // Horizontal offset - wider spread based on device
  const spreadMultiplier = isMobile ? 100 : 200;
  const translateX = distanceFromCenter * spreadMultiplier;

  // Slight vertical offset for depth
  const translateY = absDistance * 8;

  return {
    scale,
    zIndex,
    translateX,
    translateY,
  };
};

// Calculate visible videos based on active selection
const getVisibleVideos = (activeId: number | null, count: number) => {
  if (activeId === null) {
    // Default: center portion
    const startIndex = Math.floor((videos.length - count) / 2);
    return videos.slice(startIndex, startIndex + count);
  }
  
  // Find active video's position in full array
  const activeArrayIndex = videos.findIndex(v => v.id === activeId);
  const halfCount = Math.floor(count / 2);
  
  // Build visible array centered on active video
  const result = [];
  for (let i = -halfCount; i <= halfCount; i++) {
    // Wrap around using modulo
    const idx = (activeArrayIndex + i + videos.length) % videos.length;
    result.push(videos[idx]);
  }
  return result;
};

export function StackedVideos() {
  const isMobile = useIsMobile();
  const visibleCount = isMobile ? 3 : 5;
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // Get visible videos (dynamic when active, static otherwise)
  const visibleVideos = getVisibleVideos(activeVideoId, visibleCount);

  // When active, the active video is always at the center index
  const activeIndex = activeVideoId !== null ? Math.floor(visibleCount / 2) : null;

  const handleVideoClick = (videoId: number) => {
    if (activeVideoId === videoId) {
      // Clicking active video - return to spread
      setActiveVideoId(null);
      const videoEl = videoRefs.current.get(videoId);
      if (videoEl) {
        videoEl.muted = true;
      }
    } else {
      // Clicking inactive video - center it
      // Mute previous active video
      if (activeVideoId !== null) {
        const prevVideo = videoRefs.current.get(activeVideoId);
        if (prevVideo) prevVideo.muted = true;
      }

      setActiveVideoId(videoId);
      const videoEl = videoRefs.current.get(videoId);
      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.play();
      }
    }
  };

  return (
    <section className="pt-2 pb-2 md:pt-6 md:pb-6 bg-background overflow-hidden">
      <div className="container mx-auto px-5">
        {/* Title */}
        <motion.h2
          className="text-4xl font-serif font-normal text-center text-gray-900 leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          See Real <span className="text-pink-500 font-light">Transformations</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-gray-500 text-lg text-center max-w-2xl mx-auto mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Watch our clients share their skincare journey
        </motion.p>

        <div className="flex items-center justify-center relative h-[450px] md:h-[600px]">
          {visibleVideos.map((video, index) => {
            const styles = getVideoStyles(index, visibleCount, isMobile, activeIndex !== -1 ? activeIndex : null);
            const isActive = activeVideoId === video.id;

            return (
              <motion.div
                key={video.id}
                onClick={() => handleVideoClick(video.id)}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: styles.translateX,
                  y: styles.translateY,
                  scale: styles.scale,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`absolute rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 ${
                  isActive ? "ring-4 ring-pink-500 shadow-2xl" : ""
                }`}
                style={{
                  zIndex: styles.zIndex,
                  width: isMobile ? "180px" : "280px",
                  aspectRatio: "9/16",
                }}
              >
                {/* Black transparent overlay - hidden when active */}
                <motion.div
                  className="absolute inset-0 bg-black/50 z-10 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isActive ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(video.id, el);
                  }}
                  src={video.url}
                  autoPlay={isActive || activeVideoId === null}
                  loop
                  muted
                  playsInline
                  preload={isActive ? "metadata" : "none"}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
