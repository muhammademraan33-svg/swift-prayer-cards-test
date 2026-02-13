import { Card, CardContent } from "@/components/ui/card";
import { Layers, Sparkles, Frame, Image } from "lucide-react";

const products = [
  {
    icon: Layers,
    title: "Metal Prints",
    description:
      "HD photographs printed directly on aluminum. Available in .040\" and .080\" thickness, single or double-sided. Sizes from 8\"×10\" to 48\"×96\".",
    highlight: "Starting at $26",
  },
  {
    icon: Sparkles,
    title: "Acrylic Prints",
    description:
      "Vibrant, museum-quality acrylic prints with stunning depth and clarity. Available with stand-off mounting hardware in silver or black.",
    highlight: "Starting at $43",
  },
  {
    icon: Frame,
    title: "Stand-Off Mounting",
    description:
      "Float your prints off the wall with premium silver or black stand-off hardware. Creates a modern, gallery-style presentation.",
    highlight: "From $2.50 per stand-off",
  },
  {
    icon: Image,
    title: "Custom Sizes",
    description:
      "Any size from 8\"×10\" up to 48\"×96\". Rounded corner options available. Perfect for commercial, residential, and gallery installations.",
    highlight: "48–72 hour delivery",
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Card
              key={p.title}
              className="bg-card border-border hover:border-primary/40 transition-colors group"
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                  <p.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
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
