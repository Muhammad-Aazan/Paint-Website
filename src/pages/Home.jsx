import React from "react";
import {
  Navbar,
  Hero,
  TrustFeatures,
  ProductsSection,
  PromoBanners,
  ConsultationBanner,
  BrandsShowcase,
  Testimonials,
  Footer,
} from "@/components";

export default function Home() {
  return (
    <div className="home-page-root">
      <Navbar />
      {/* 1. Dynamic Animated Hero Carousel */}
      <Hero />

      {/* 2. Pakistani Trust & Quality Features Bar */}
      <TrustFeatures />

      {/* 3. Featured Flagship Products Showcase */}
      <ProductsSection />

      {/* 4. Active Promotional Discount Vouchers */}
      <PromoBanners />

      {/* 5. Architectural Villa & Contractor Blueprint Consultation Banner */}
      <ConsultationBanner />

      {/* 6. Authorized Paint & Coating Partner Distributorships */}
      <BrandsShowcase />

      {/* 7. Real Verified Customer & Master Painter Reviews */}
      <Testimonials />

      <Footer />
    </div>
  );
}