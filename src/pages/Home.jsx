import React from "react";
import { Navbar, Hero, ProductsSection, Testimonials, Footer } from "@/components";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <ProductsSection />
      <Testimonials />
      <Footer />
    </div>
  );
}