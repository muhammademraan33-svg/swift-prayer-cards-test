import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Contact Us
          </h2>
          <p className="text-muted-foreground font-body mt-4">
            Have questions or need a custom quote? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <Card className="bg-card border-border">
            <CardContent className="p-8 space-y-6">
              <div>
                <Label htmlFor="name" className="font-body text-foreground text-sm">Name</Label>
                <Input id="name" placeholder="Your name" className="mt-1 bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label htmlFor="email" className="font-body text-foreground text-sm">Email</Label>
                <Input id="email" type="email" placeholder="you@email.com" className="mt-1 bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label htmlFor="message" className="font-body text-foreground text-sm">Message</Label>
                <Textarea id="message" placeholder="Tell us about your project..." className="mt-1 bg-secondary border-border text-foreground min-h-[120px]" />
              </div>
              <Button className="w-full bg-gradient-gold text-primary-foreground font-body font-semibold tracking-wide hover:opacity-90">
                Send Message
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col justify-center space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Email Us</h3>
                <p className="text-muted-foreground font-body text-sm">info@luxurymetalprints.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Call Us</h3>
                <p className="text-muted-foreground font-body text-sm">Available Mon–Fri, 9am–5pm EST</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                We offer volume discounts for orders of 10+ prints. Contact us for wholesale and commercial pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
