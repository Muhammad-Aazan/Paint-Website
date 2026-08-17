import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductCard, { ProductCardSkeleton } from "@/components/common/ProductCard";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common/useToast";

import { addToWishlist as addWishlist, removeFromWishlist as removeWishlist } from "@/features/wishlist/wishlistSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { supabase } from "@/services/supabase";
import { syncWishlistToSupabase, syncCartToSupabase } from "@/services/supabaseHelpers";

import paintBucket1 from "@/assets/paint-bkt-1.png";
import paintBucket2 from "@/assets/paint-bkt-2.png";
import paintBucket3 from "@/assets/paint-bkt-3.png";
import paintBrush   from "@/assets/paint-brush-1.png";
import roller       from "@/assets/roller.png";
import spray        from "@/assets/spray.png";

const fallbackProducts = [
  { id: 1, image: paintBucket1, category: "Interior Paint",  name: "Cobalt Hour — Matte",      rating: "★★★★★", reviews: "128", price: 2450, unit: "/ gallon", stock: 24 },
  { id: 2, image: paintBucket2, category: "Exterior Paint",  name: "Clay Pot — Weatherproof",  rating: "★★★★☆", reviews: "94",  price: 2850, unit: "/ gallon", stock: 9  },
  { id: 3, image: paintBucket3, category: "Premium Paint",   name: "Forest Green",             rating: "★★★★★", reviews: "210", price: 3250, unit: "/ gallon", stock: 31 },
  { id: 4, image: paintBrush,   category: "Brush",           name: "Premium Paint Brush",      rating: "★★★★☆", reviews: "85",  price: 750,  unit: "/ piece",  stock: 7  },
  { id: 5, image: roller,       category: "Roller",          name: "Professional Roller",      rating: "★★★★★", reviews: "61",  price: 950,  unit: "/ piece",  stock: 22 },
  { id: 6, image: spray,        category: "Spray Gun",       name: "Professional Spray Gun",   rating: "★★★★★", reviews: "44",  price: 3500, unit: "/ piece",  stock: 0  },
];

export default function ProductsSection({
  limit,
  searchQuery = "",
  sortBy = "Newest",
  categoryFilter = "All",
  maxPrice = 10000,
  inStockOnly = false,
  minRating = 0,
}) {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const toast      = useToast();

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems     = useSelector((state) => state.cart.items);
  const { user }      = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data?.length) {
          setProducts(fallbackProducts);
        } else {
          setProducts(data);
        }
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter & sort
  let processed = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (q && !p.name?.toLowerCase().includes(q) && !(p.category || "").toLowerCase().includes(q)) {
      return false;
    }

    if (categoryFilter && categoryFilter !== "All") {
      const cat = (p.category || "").toLowerCase();
      const targetCat = categoryFilter.toLowerCase();
      if (!cat.includes(targetCat) && !targetCat.includes(cat)) {
        return false;
      }
    }

    const priceNum = typeof p.price === "number" ? p.price : Number(String(p.price).replace(/[^0-9.-]+/g, "")) || 0;
    if (maxPrice && priceNum > Number(maxPrice)) {
      return false;
    }

    if (inStockOnly && p.stock !== undefined && p.stock === 0) {
      return false;
    }

    if (minRating && minRating > 0) {
      const starCount = (p.rating || "").split("★").length - 1;
      const score = p.ratingScore || (starCount > 0 ? starCount : 5);
      if (score < minRating) return false;
    }

    return true;
  });

  if (sortBy === "Price Low to High")  processed.sort((a, b) => +a.price - +b.price);
  if (sortBy === "Price High to Low")  processed.sort((a, b) => +b.price - +a.price);
  if (sortBy === "Best Selling")       processed.sort((a, b) => +(b.reviews || 0) - +(a.reviews || 0));
  if (sortBy === "Highest Rated")      processed.sort((a, b) => +((b.rating || "").split("★").length - 1) - +((a.rating || "").split("★").length - 1));

  const visible = limit === false ? processed : processed.slice(0, 6);
  const wishlistIds = new Set(wishlistItems.map((i) => String(i.id)));

  async function handleAddToWishlist(product) {
    const item = {
      id: product.id,
      name: product.name,
      image: product.image_url || product.image,
      category: product.category || "Product",
      price: typeof product.price === "number" ? `Rs. ${product.price.toLocaleString()}` : product.price || "Rs. 0",
      unit: product.unit || "/ piece",
      rating: product.rating || "★★★★★",
      reviews: product.reviews || "0",
    };

    dispatch(addWishlist(item));
    toast?.show(`"${product.name}" added to wishlist ❤️`, "success");

    const updated = [...wishlistItems, item];
    await syncWishlistToSupabase(user, updated);
  }

  async function handleRemoveFromWishlist(productId) {
    dispatch(removeWishlist(productId));
    const updated = wishlistItems.filter((i) => String(i.id) !== String(productId));
    await syncWishlistToSupabase(user, updated);
  }

  function handleAddToCart(product) {
    // Always store price as a raw number — never a formatted string
    const rawPrice = typeof product.price === "number"
      ? product.price
      : Number(String(product.price || 0).replace(/[^0-9.-]+/g, "")) || 0;

    const item = {
      ...product,
      id: String(product.id),
      image: product.image_url || product.image,
      category: product.category || "Product",
      price: rawPrice,        // stored as number e.g. 10000
      unit: product.unit || "/ piece",
    };
    dispatch(addToCart(item));
    toast?.show(`"${product.name}" added to cart 🛒`, "success");

    // Sync to Supabase
    if (user?.id) {
      const updatedCart = [
        ...cartItems.filter((i) => String(i.id) !== String(item.id)),
        { ...item, quantity: (cartItems.find((i) => String(i.id) === String(item.id))?.quantity || 0) + 1 },
      ];
      syncCartToSupabase(user.id, updatedCart).catch(() => {});
    }
  }

  return (
    <section className="products">
      <div className="wrap">
        {limit !== false && (
          <div className="products-header">
            <div>
              <p className="products-eyebrow">Best Sellers</p>
              <h2 className="products-title">Shop paint & tools.</h2>
            </div>
            <Button
              text="View All Products →"
              className="btn btn-ghost"
              onClick={() => navigate("/shop")}
            />
          </div>
        )}

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: limit === false ? 8 : 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-wishlist-copy">No products match your search.</p>
            <Button text="Clear Search" className="btn btn-ghost" onClick={() => navigate("/shop")} />
          </div>
        ) : (
          <div className="products-grid">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image_url || product.image}
                category={product.category || "Product"}
                name={product.name}
                rating={product.rating || "★★★★★"}
                reviews={product.reviews || "0"}
                price={typeof product.price === "number" ? `Rs. ${product.price.toLocaleString()}` : product.price}
                unit={product.unit || "/ piece"}
                stock={product.stock}
                product={product}
                addToWishlist={handleAddToWishlist}
                removeFromWishlist={handleRemoveFromWishlist}
                isWishlist={wishlistIds.has(String(product.id))}
                addToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}