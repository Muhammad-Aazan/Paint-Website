// Banner helper utility for Hero Carousel and Promotional Offer Banners

export const defaultHeroBanners = [
  {
    id: "banner-1",
    badge: "✦ PAKISTAN'S PREMIER ARCHITECTURAL PAINT HOUSE",
    title: "Luminous Velvet Silk & Washable Wall Emulsions",
    subtitle: "Infused with rich light-reflecting micro-pigments, stain-resistant nanotech, and zero-VOC eco resins for vibrant, airy, and luxurious spaces.",
    ctaText: "Explore Luxury Paints →",
    ctaUrl: "/shop?category=Interior%20Paint",
    bgImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=85",
    colorAccent: "#d4882a",
    active: true,
  },
  {
    id: "banner-2",
    badge: "🛡️ 10-YEAR ALL-WEATHER MONSOON SHIELD",
    title: "Exterior Weatherproof Pure Acrylics & Cool Roofs",
    subtitle: "Heavy-duty UV barrier engineered for Pakistan's heat and monsoons. Reflects up to 90% of solar heat and prevents algae, peeling, and dampness.",
    ctaText: "Discover Weather Shields →",
    ctaUrl: "/shop?category=Exterior%20Paint",
    bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85",
    colorAccent: "#2b5299",
    active: true,
  },
  {
    id: "banner-3",
    badge: "🎨 10,000+ COMPUTERIZED BESPOKE SHADES",
    title: "Precision Color Formulation & Contractor Tools",
    subtitle: "Instant spectrophotometer accuracy tinting paired with ultra-dense microfiber rollers, precision sash brushes, and HVLP spray gear.",
    ctaText: "Browse All Products →",
    ctaUrl: "/shop",
    bgImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1920&q=85",
    colorAccent: "#10b981",
    active: true,
  },
];

export const defaultPromoDeals = [
  {
    id: "deal-1",
    badge: "SEASONAL SAVINGS",
    discount: "20% OFF",
    title: "Architectural Interior Matte & Velvet Emulsions",
    desc: "Apply discount code on all interior gallons and quarter cans for living rooms and master suites.",
    code: "WELCOME20",
    bgGradient: "linear-gradient(135deg, #1e3d6e 0%, #2b5299 100%)",
    accent: "#e9a445",
    active: true,
  },
  {
    id: "deal-2",
    badge: "MONSOON SHIELD",
    discount: "Rs. 500 OFF",
    title: "Exterior Weatherproof Acrylic & Elastomeric Paints",
    desc: "Heavy-duty UV and dampness protection for house exteriors, boundary walls, and rooftops.",
    code: "DRIP500",
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    accent: "#6ee7b7",
    active: true,
  },
  {
    id: "deal-3",
    badge: "BULK CONTRACTOR",
    discount: "FREE SHIPPING",
    title: "Full House & Commercial Villa Orders (Above Rs. 15k)",
    desc: "Direct factory freight dispatch across Pakistan with zero shipping charges and priority tinting.",
    code: "FREESHIP",
    bgGradient: "linear-gradient(135deg, #b07d2d 0%, #d4882a 100%)",
    accent: "#fef3c7",
    active: true,
  },
];

export function getAllHeroBanners() {
  try {
    const raw = localStorage.getItem("drip_hero_banners_v2");
    if (!raw) {
      localStorage.setItem("drip_hero_banners_v2", JSON.stringify(defaultHeroBanners));
      return defaultHeroBanners;
    }
    const custom = JSON.parse(raw);
    if (!custom || custom.length === 0) {
      return defaultHeroBanners;
    }
    return custom;
  } catch {
    return defaultHeroBanners;
  }
}

export function saveHeroBanner(banner) {
  const current = getAllHeroBanners();
  const id = banner.id || `banner-${Date.now()}`;

  const newBanner = {
    ...banner,
    id,
    badge: banner.badge || "✦ FEATURED COLLECTION",
    title: banner.title || "Premium Paint Series",
    subtitle: banner.subtitle || "High performance coatings for residential and commercial spaces.",
    ctaText: banner.ctaText || "Shop Now →",
    ctaUrl: banner.ctaUrl || "/shop",
    bgImage: banner.bgImage || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1920&q=80",
    colorAccent: banner.colorAccent || "#38bdf8",
    active: banner.active !== undefined ? banner.active : true,
    created_at: banner.created_at || new Date().toISOString(),
  };

  const updated = [newBanner, ...current.filter((b) => b.id !== id)];
  localStorage.setItem("drip_hero_banners_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "BANNERS_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Banner broadcast error:", e);
  }

  return newBanner;
}

export function deleteHeroBanner(id) {
  const current = getAllHeroBanners();
  const updated = current.filter((b) => b.id !== id);
  localStorage.setItem("drip_hero_banners_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "BANNERS_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Banner broadcast error:", e);
  }

  return true;
}

export function toggleHeroBannerStatus(id) {
  const current = getAllHeroBanners();
  const updated = current.map((b) => {
    if (b.id === id) return { ...b, active: !b.active };
    return b;
  });
  localStorage.setItem("drip_hero_banners_db", JSON.stringify(updated));
  return updated;
}

// PROMO DEALS
export function getAllPromoDeals() {
  try {
    const custom = JSON.parse(localStorage.getItem("drip_promo_deals_db") || "[]");
    if (!custom || custom.length === 0) {
      localStorage.setItem("drip_promo_deals_db", JSON.stringify(defaultPromoDeals));
      return defaultPromoDeals;
    }
    return custom;
  } catch {
    return defaultPromoDeals;
  }
}

export function savePromoDeal(deal) {
  const current = getAllPromoDeals();
  const id = deal.id || `deal-${Date.now()}`;

  const newDeal = {
    ...deal,
    id,
    badge: deal.badge || "SPECIAL OFFER",
    discount: deal.discount || "10% OFF",
    title: deal.title || "Special Deal",
    desc: deal.desc || "Limited time offer on select paint collections.",
    code: (deal.code || "DRIP10").toUpperCase(),
    bgGradient: deal.bgGradient || "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    accent: deal.accent || "#a5b4fc",
    active: deal.active !== undefined ? deal.active : true,
    created_at: deal.created_at || new Date().toISOString(),
  };

  const updated = [newDeal, ...current.filter((d) => d.id !== id)];
  localStorage.setItem("drip_promo_deals_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "DEALS_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Deals broadcast error:", e);
  }

  return newDeal;
}

export function deletePromoDeal(id) {
  const current = getAllPromoDeals();
  const updated = current.filter((d) => d.id !== id);
  localStorage.setItem("drip_promo_deals_db", JSON.stringify(updated));
  return true;
}

// STORE ANNOUNCEMENT TEXT
export function getStoreAnnouncement() {
  return localStorage.getItem("drip_promo_banner_text") || "✦ Free color matching in every branch · Nationwide fast delivery · New arrivals every week ✦";
}

export function saveStoreAnnouncement(text) {
  localStorage.setItem("drip_promo_banner_text", text);
  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "ANNOUNCEMENT_UPDATED",
        payload: text,
      });
    }
  } catch (e) {
    console.warn("Announcement broadcast error:", e);
  }
}
