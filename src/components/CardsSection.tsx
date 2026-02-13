import { Card, CardContent } from "@/components/ui/card";
import { cardPricing } from "@/lib/pricing";
import { Heart, Briefcase, Mail, BookOpen } from "lucide-react";

const cards = [
  {
    icon: Heart,
    title: "Eternity Cards",
    description: "Beautifully crafted metal keepsake cards for memorials and celebrations of life.",
    pricing: cardPricing.eternityCard,
    packs: ["1 card", "10 pack", "25 pack", "55 pack"],
    prices: [
      cardPricing.eternityCard.single,
      cardPricing.eternityCard.pack10,
      cardPricing.eternityCard.pack25,
      cardPricing.eternityCard.pack55,
    ],
  },
  {
    icon: Briefcase,
    title: "Business Cards",
    description: "Make an unforgettable first impression with premium metal business cards.",
    pricing: cardPricing.businessCard,
    packs: ["1 card", "25 pack", "50 pack", "100 pack"],
    prices: [
      cardPricing.businessCard.single,
      cardPricing.businessCard.pack25,
      cardPricing.businessCard.pack50,
      cardPricing.businessCard.pack100,
    ],
  },
  {
    icon: Mail,
    title: "Invitations",
    description: "Elevate your special events with stunning metal invitations that stand apart.",
    pricing: cardPricing.invitationCard,
    packs: ["1 card", "25 pack", "50 pack"],
    prices: [
      cardPricing.invitationCard.single,
      cardPricing.invitationCard.pack25,
      cardPricing.invitationCard.pack50,
    ],
  },
  {
    icon: BookOpen,
    title: "Prayer Cards",
    description: "Timeless metal prayer cards crafted to honor and remember loved ones.",
    pricing: cardPricing.prayerCard,
    packs: ["1 card", "10 pack", "25 pack", "55 pack"],
    prices: [
      cardPricing.prayerCard.single,
      cardPricing.prayerCard.pack10,
      cardPricing.prayerCard.pack25,
      cardPricing.prayerCard.pack55,
    ],
  },
];

const CardsSection = () => {
  return (
    <section id="cards" className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-primary font-body">
            Metal Cards
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 text-foreground">
            Cards That Last Forever
          </h2>
          <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            From eternity cards to business cards — precision-cut metal cards that
            leave a lasting impression.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((c) => (
            <Card key={c.title} className="bg-card border-border overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground font-body">{c.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {c.packs.map((pack, i) => (
                    <div
                      key={pack}
                      className="bg-secondary/50 rounded p-3 text-center border border-border"
                    >
                      <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">
                        {pack}
                      </p>
                      <p className="text-lg font-display font-bold text-primary">
                        ${c.prices[i]}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardsSection;
