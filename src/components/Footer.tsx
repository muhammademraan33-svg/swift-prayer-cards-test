const scrollTo = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-lg font-bold text-gradient-gold block mb-4 tracking-[0.1em] uppercase">
              Luxury Metal Prints
            </span>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Bespoke museum-grade metal & acrylic prints. Handcrafted in the USA for discerning collectors.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-body font-semibold text-foreground uppercase tracking-[0.2em] mb-4">
              Collection
            </p>
            <ul className="space-y-2">
              {[
                { label: "Metal Prints", href: "#shop-by-size" },
                { label: "Acrylic Prints", href: "#shop-by-size" },
                { label: "Curated Sets", href: "#bundles" },
                { label: "Gallery", href: "#shop-by-image" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-body font-semibold text-foreground uppercase tracking-[0.2em] mb-4">
              Concierge
            </p>
            <ul className="space-y-2">
              {[
                { label: "FAQ", href: "#faq" },
                { label: "Shipping & Delivery", href: "#faq" },
                { label: "Contact Us", href: "#contact" },
                { label: "Custom Commission", href: "#calculator" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="text-sm text-muted-foreground font-body hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-body font-semibold text-foreground uppercase tracking-[0.2em] mb-4">
              Promise
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li>Handcrafted in USA</li>
              <li>Lifetime Guarantee</li>
              <li>Fast Nationwide Shipping</li>
              <li>White-Glove Delivery</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Luxury Metal Prints. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground font-body">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
