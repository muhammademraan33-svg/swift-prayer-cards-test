import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reviews = [
  {
    name: "Rose B.",
    location: "Scottsdale, AZ",
    text: "The depth and luminosity on metal is unlike anything I've seen. It's become the centerpiece of our great room.",
    rating: 5,
  },
  {
    name: "James A.",
    location: "Highland Park, TX",
    text: "We commissioned a 48×72 piece for our foyer. The color fidelity and finish rival gallery installations we've collected.",
    rating: 5,
  },
  {
    name: "Steven G.",
    location: "La Jolla, CA",
    text: "I sent a photo from our estate in Tuscany. They enhanced the tonal range beautifully — true museum quality.",
    rating: 5,
  },
  {
    name: "Maria L.",
    location: "West Lake Hills, TX",
    text: "Ordered a curated three-piece set for our living room. The presentation and packaging were impeccable.",
    rating: 5,
  },
  {
    name: "David K.",
    location: "Cherry Hills, CO",
    text: "After working with several high-end print studios, this is the finest quality and service I've experienced.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    location: "Coral Gables, FL",
    text: "The acrylic has an ethereal luminous quality that transforms in different light. Every guest asks about it.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="reviews" className="py-28 md:py-36 px-6 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-body mb-4">
            Client Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Trusted by Collectors
          </h2>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-body tracking-wide">
            4.8 out of 5 — based on 2,000+ commissions
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <Card key={r.name} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 font-body leading-relaxed mb-4 italic">
                  "{r.text}"
                </p>
                <div>
                  <p className="text-sm font-body font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{r.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
