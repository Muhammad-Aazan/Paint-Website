// Brand helper utility for Drip Paints partner brands

export const defaultBrands = [
  { id: "b-1", name: "Dulux", origin: "AkzoNobel", highlight: "Architectural Emulsions", active: true },
  { id: "b-2", name: "Brighto", origin: "Pakistan", highlight: "Super Emulsions & Weathercoat", active: true },
  { id: "b-3", name: "Berger", origin: "Robbialac", highlight: "VIP Weathercoat & Enamels", active: true },
  { id: "b-4", name: "Nippon", origin: "Japan", highlight: "Anti-Bacterial & Odourless", active: true },
  { id: "b-5", name: "Master", origin: "Pakistan", highlight: "Super Emulsion & Synthetic", active: true },
  { id: "b-6", name: "Jotun", origin: "Norway", highlight: "Fenomastic & Majestic", active: true },
  { id: "b-7", name: "Diamond", origin: "Pakistan", highlight: "Ace All-Weather & WoodCoat", active: true },
  { id: "b-8", name: "Dadex", origin: "Building Systems", highlight: "Pipes & Wall Protection", active: true },
];

export function getAllBrands() {
  try {
    const custom = JSON.parse(localStorage.getItem("drip_brands_db") || "[]");
    if (!custom || custom.length === 0) {
      localStorage.setItem("drip_brands_db", JSON.stringify(defaultBrands));
      return defaultBrands;
    }
    return custom;
  } catch {
    return defaultBrands;
  }
}

export function saveBrand(brand) {
  const current = getAllBrands();
  const id = brand.id || `brand-${Date.now()}`;
  const newBrand = {
    ...brand,
    id,
    name: (brand.name || "").trim(),
    origin: brand.origin || "International",
    highlight: brand.highlight || "Premium Coatings",
    active: brand.active !== undefined ? brand.active : true,
    created_at: brand.created_at || new Date().toISOString(),
  };

  const updated = [newBrand, ...current.filter((b) => b.id !== id && b.name.toLowerCase() !== newBrand.name.toLowerCase())];
  localStorage.setItem("drip_brands_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "BRANDS_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Brand broadcast error:", e);
  }

  return newBrand;
}

export function deleteBrand(idOrName) {
  const current = getAllBrands();
  const updated = current.filter((b) => b.id !== idOrName && b.name !== idOrName);
  localStorage.setItem("drip_brands_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "BRANDS_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Brand broadcast error:", e);
  }

  return true;
}
