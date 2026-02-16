import { Upload, Palette, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Choose Your Image",
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
    title: "Guaranteed Delivery",
    description: "Each piece is handcrafted and inspected to perfection. We guarantee delivery in 48–72 hours.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-14 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-primary font-body mb-2">
            The Process
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            From Vision to Masterpiece
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="flex items-start gap-4 group">
              <div className="relative shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-foreground mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
