const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-lg font-bold text-gradient-gold">
          LuxuryMetalPrints
        </span>
        <p className="text-sm text-muted-foreground font-body">
          © {new Date().getFullYear()} Luxury Metal Prints. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm font-body text-muted-foreground">
          <span>48–72 Hour Delivery</span>
          <span>·</span>
          <span>Premium Quality</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
