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
import { defaultProducts } from "@/services/productHelpers";

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

  const [products, setProducts] = useState(defaultProducts);
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
          setProducts(defaultProducts);
        } else {
          const isOldMock =
            data.length <= 6 &&
            data.some((p) =>
              ["Cobalt Hour — Matte", "Clay Pot — Weatherproof", "Forest Green", "Premium Paint Brush"].includes(p.name)
            );

          if (isOldMock) {
            setProducts(defaultProducts);
          } else {
            setProducts(data);
          }
        }
      } catch {
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();

    // Listen to real-time stock reduction broadcasts
    let channel;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("drip_orders_realtime");
        channel.onmessage = (event) => {
          if (event.data?.type === "PRODUCT_STOCK_DEDUCTED") {
            const { productId, quantityDeducted } = event.data.payload;
            setProducts((prev) =>
              prev.map((p) => {
                if (String(p.id) === String(productId)) {
                  const curr = typeof p.stock === "number" ? p.stock : 50;
                  return { ...p, stock: Math.max(0, curr - quantityDeducted) };
                }
                return p;
              })
            );
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel error:", e.message);
    }

    return () => {
      if (channel) channel.close();
    };
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