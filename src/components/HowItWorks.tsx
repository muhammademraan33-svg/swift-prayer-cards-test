import { Upload, Palette, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Submit Your Vision",
    description: "Upload any photograph. Our artisans review each submission and enhance for museum-grade reproduction.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Select Your Medium",
    description: "Choose from brushed aluminum, polished metal, or luminous acrylic — each with bespoke sizing up to 48×96\".",
  },
  {
    icon: Package,
    step: "03",
    title: "White-Glove Delivery",
    description: "Each piece is handcrafted, inspected, and shipped in protective archival packaging within 48–72 hours.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 md:py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary font-body mb-4">
            The Process
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            From Vision to Masterpiece
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-16 md:gap-10">
          {steps.map((s) => (
            <div key={s.step} className="text-center group">
              <div className="relative mb-8">
                <span className="text-7xl font-display font-bold text-foreground/[0.03] absolute -top-4 left-1/2 -translate-x-1/2">
                  {s.step}
                </span>
                <div className="relative w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs mx-auto">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
