import interiorImg from "@/assets/cat-interior.png";
import exteriorImg from "@/assets/cat-exterior.png";
import primerImg   from "@/assets/cat-primer.png";
import brushesImg  from "@/assets/cat-brushes.png";
import rollersImg  from "@/assets/cat-rollers.png";
import sprayImg    from "@/assets/cat-spray.png";

export const defaultCategories = [
  {
    id: "cat-1",
    slug: "interior-paint",
    title: "Interior Paint",
    description: "Transform your living spaces with rich, washable matte and eggshell finishes.",
    image: interiorImg,
    count: "42 products",
    tag: "Most Popular",
    color: "var(--cobalt)",
    featured: true,
  },
  {
    id: "cat-2",
    slug: "exterior-paint",
    title: "Exterior Paint",
    description: "Weatherproof formulas that resist UV, heat, and Pakistan's harsh monsoons.",
    image: exteriorImg,
    count: "28 products",
    tag: "All-Weather",
    color: "var(--sage)",
    featured: true,
  },
  {
    id: "cat-3",
    slug: "primers-sealers",
    title: "Primers & Sealers",
    description: "Professional-grade adhesion primers for walls, wood, metal and concrete.",
    image: primerImg,
    count: "18 products",
    tag: "Pro Series",
    color: "var(--saffron)",
    featured: true,
  },
  {
    id: "cat-4",
    slug: "brushes",
    title: "Brushes",
    description: "Hand-selected bristle and synthetic brushes for flawless cut-in work.",
    image: brushesImg,
    count: "24 products",
    tag: "Precision",
    color: "var(--poppy)",
    featured: true,
  },
  {
    id: "cat-5",
    slug: "rollers-frames",
    title: "Rollers & Frames",
    description: "Low-splatter rollers for smooth, professional coverage on any surface.",
    image: rollersImg,
    count: "15 products",
    tag: "Smooth Finish",
    color: "var(--cobalt-light)",
    featured: true,
  },
  {
    id: "cat-6",
    slug: "spray-equipment",
    title: "Spray Equipment",
    description: "Electric HVLP and airless sprayers for large-scale professional projects.",
    image: sprayImg,
    count: "9 products",
    tag: "Professional",
    color: "var(--sage-light)",
    featured: true,
  },
];

export function getAllCategories() {
  try {
    const custom = JSON.parse(localStorage.getItem("drip_categories_db") || "[]");
    if (!custom || custom.length === 0) {
      localStorage.setItem("drip_categories_db", JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    return custom;
  } catch (err) {
    console.warn("getAllCategories error:", err);
    return defaultCategories;
  }
}

export function saveCategory(cat) {
  const current = getAllCategories();
  const title = (cat.title || "").trim();
  const slug = cat.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const id = cat.id || `cat-${Date.now()}`;

  const newCat = {
    ...cat,
    id,
    slug,
    title,
    description: cat.description || "",
    image: cat.image || interiorImg,
    count: cat.count || "0 products",
    tag: cat.tag || "New",
    color: cat.color || "var(--cobalt)",
    featured: cat.featured !== undefined ? cat.featured : true,
    created_at: cat.created_at || new Date().toISOString(),
  };

  const updated = [newCat, ...current.filter((c) => c.id !== id && c.slug !== slug)];
  localStorage.setItem("drip_categories_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "CATEGORIES_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Category broadcast error:", e);
  }

  return newCat;
}

export function deleteCategory(idOrSlug) {
  const current = getAllCategories();
  const updated = current.filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug && c.title !== idOrSlug);
  localStorage.setItem("drip_categories_db", JSON.stringify(updated));

  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "CATEGORIES_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Category broadcast error:", e);
  }

  return true;
}

export function toggleCategoryFeatured(id) {
  const current = getAllCategories();
  const updated = current.map((c) => {
    if (c.id === id) {
      return { ...c, featured: !c.featured };
    }
    return c;
  });
  localStorage.setItem("drip_categories_db", JSON.stringify(updated));
  return updated;
}
