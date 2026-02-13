import { Card, CardContent } from "@/components/ui/card";
import metalPrintImg from "@/assets/metal-print.jpg";
import acrylicPrintImg from "@/assets/acrylic-print.jpg";

const products = [
  {
    image: metalPrintImg,
    title: "Metal Prints",
    description:
      'HD photographs printed directly on aluminum. Available in .040" and .080" thickness, single or double-sided. Sizes from 8"×10" to 48"×96".',
    highlight: "Starting at $12",
  },
  {
    image: acrylicPrintImg,
    title: "Acrylic Prints",
    description:
      "Vibrant, museum-quality acrylic prints with stunning depth and clarity. Available with stand-off mounting hardware in silver or black.",
    highlight: "Starting at $20",
  },
];

const ProductsSection = () => {
  return (
    <section id="products" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Our Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Custom Metal & Acrylic Prints
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Transform your images into breathtaking metal and acrylic masterpieces,
            delivered to your door in as little as 48 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((p) => (
            <Card
              key={p.title}
              className="bg-card border-border hover:border-primary/40 transition-colors group overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-display font-semibold text-foreground mb-3">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                  {p.description}
                </p>
                <span className="text-sm font-body font-semibold text-primary">
                  {p.highlight}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
