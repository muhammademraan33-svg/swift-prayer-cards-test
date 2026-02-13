import { Shield, Clock, Award } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "48–72 Hour Delivery",
    description: "Fast turnaround without compromising quality. Your prints ship within 2–3 business days.",
  },
  {
    icon: Shield,
    title: "Premium Materials",
    description: "We use only the finest aluminum and acrylic substrates for vivid, long-lasting prints.",
  },
  {
    icon: Award,
    title: "Gallery Quality",
    description: "Every print is inspected for color accuracy and finish quality before it ships.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 bg-secondary/20">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
          Why Choose Us
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground mb-16">
          The Luxury Difference
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
