import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import metalLiving from "@/assets/carousel-metal-living.jpg";
import acrylicDining from "@/assets/carousel-acrylic-dining.jpg";
import dividerLoft from "@/assets/carousel-divider-loft.jpg";
import acrylicBedroom from "@/assets/carousel-acrylic-bedroom.jpg";
import metalOffice from "@/assets/carousel-metal-office.jpg";

const slides = [
  {
    image: metalLiving,
    label: "Grand Scale",
    caption: "Turn your wedding portrait into a grand-scale metal print — timeless elegance for your forever moment.",
  },
  {
    image: acrylicDining,
    label: "Acrylic Print",
    caption: "Vivid acrylic artwork elevates a penthouse dining room with luminous depth and color.",
  },
  {
    image: dividerLoft,
    label: "Double-Sided Divider",
    caption: "A double-sided metal print hangs as a dramatic suspended divider in a grand hotel lobby.",
  },
  {
    image: acrylicBedroom,
    label: "Backlit Acrylic",
    caption: "A backlit acrylic masterpiece brings warmth and elegance to a luxury master suite.",
  },
  {
    image: metalOffice,
    label: "Family Gallery Wall",
    caption: "A coordinated family gallery wall — the same family captured across seasons on frameless metal and acrylic prints.",
  },
];

const LuxuryShowcase = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 px-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
          In Situ
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
          Prints in Luxury Spaces
        </h2>
        <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
          See how metal prints, acrylic art, and double-sided room dividers
          transform America's most discerning interiors.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative max-w-6xl mx-auto">
        <div ref={emblaRef} className="overflow-hidden rounded-2xl">
          <div className="flex">
            {slides.map((slide, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 relative">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="inline-block w-fit px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-body tracking-widest uppercase mb-2">
                    {slide.label}
                  </span>
                  <p className="text-white/90 font-body text-sm md:text-base max-w-lg leading-relaxed">
                    {slide.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === selectedIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryShowcase;
