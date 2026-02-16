import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is a metal print?",
    a: "A metal print is a high-definition photograph printed directly onto aluminum using a dye-sublimation process. The result is an ultra-vivid, waterproof, scratch-resistant print with stunning depth and clarity that lasts a lifetime.",
  },
  {
    q: "What photo resolution do I need?",
    a: "For best results, we recommend at least 150 DPI at your chosen print size. A standard smartphone photo (12MP+) works beautifully for prints up to 24\"×36\". Our team reviews every order and will contact you if we see any quality concerns.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard delivery is 48–72 hours from production. We also offer LuXpress (47-hour) and Overnight (24-hour) shipping options.",
  },
  {
    q: "What's the difference between metal and acrylic prints?",
    a: "Metal prints have a modern, industrial look with incredible color saturation printed directly on brushed aluminum. Acrylic prints offer a luminous, glass-like finish with exceptional depth. Both are museum-grade and built to last.",
  },
  {
    q: "Can I upload any image?",
    a: "Yes! We accept JPEG, PNG, TIFF, and most standard image formats. You can upload your own photos or browse our curated gallery of millions of high-resolution stock images from Pexels.",
  },
  {
    q: "Do you offer bulk or wholesale pricing?",
    a: "Yes, we offer volume discounts for orders of 10+ prints. Our bundle packs save up to 31% off individual pricing. Contact us for commercial and wholesale inquiries.",
  },
  {
    q: "What sizes are available?",
    a: "We offer 21 standard sizes from 8\"×10\" up to 48\"×96\", plus fully custom sizes. Whether you need a small desk print or a massive statement wall piece, we've got you covered.",
  },
  {
    q: "Is there a satisfaction guarantee?",
    a: "Absolutely. Every print is inspected for color accuracy and finish quality before shipping. If you're not completely satisfied, we'll reprint or refund your order — no questions asked.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-body mb-4">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            Common Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border rounded-lg px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-body font-medium text-foreground text-sm hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground font-body leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
