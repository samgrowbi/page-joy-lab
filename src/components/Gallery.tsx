import gallery1 from "@/assets/gallery-1.webp";
import gallery2 from "@/assets/gallery-2.webp";
import gallery3 from "@/assets/gallery-3.webp";

const images = [
  gallery1,
  gallery2,
  gallery3,
];

export function Gallery() {
  return (
    <section className="py-4 md:py-6 bg-white" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {images.map((src, i) => (
            <img
              key={`gallery-${i}`}
              src={src}
              alt="Our spa"
              loading="lazy"
              className="w-full h-40 md:h-56 lg:h-64 rounded-xl object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
