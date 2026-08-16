import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Navbar, Footer, ProductCard, Button } from "@/components";
import { removeFromWishlist, clearWishlist, setWishlist } from "@/features/wishlist/wishlistSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { getWishlistFromSupabase, syncWishlistToSupabase } from "@/services/supabaseHelpers";

export default function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadWishlist() {
      try {
        setLoading(true);
        const remoteWishlist = await getWishlistFromSupabase(user);
        if (remoteWishlist && remoteWishlist.length > 0) {
          dispatch(setWishlist(remoteWishlist));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [dispatch, user]);

  useEffect(() => {
    async function sync() {
      try {
        await syncWishlistToSupabase(user, wishlist);
      } catch (err) {
        console.error(err);
      }
    }

    sync();
  }, [user, wishlist]);

  function handleRemoveFromWishlist(id) {
    dispatch(removeFromWishlist(id));
  }

  function handleAddToCart(product) {
    dispatch(addToCart(product));
  }

  function handleClearWishlist() {
    dispatch(clearWishlist());
  }

  return (
    <>
      <Navbar />

      <section className="wishlist-page">
        <div className="wrap">
          <div className="products-head wishlist-header">
            <div>
              <p className="products-eyebrow">YOUR FAVORITES</p>
              <h2 className="products-title">Wishlist</h2>
              {wishlist.length > 0 && (
                <p className="wishlist-summary">You have {wishlist.length} saved product{wishlist.length > 1 ? "s" : ""}.</p>
              )}
            </div>

            {wishlist.length > 0 && <Button text="Clear wishlist" className="btn btn-outline" onClick={handleClearWishlist} />}
          </div>

          {loading ? (
            <p className="empty-wishlist-copy">Syncing wishlist...</p>
          ) : wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-wishlist-illustration">
                <svg viewBox="0 0 80 80" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="40" cy="32" r="28" opacity="0.12" />
                  <path d="M24 32c0-8.8 7.2-16 16-16s16 7.2 16 16-7.2 16-16 16-16-7.2-16-16z" />
                  <path d="M40 46v12" strokeLinecap="round" />
                  <path d="M32 54h16" strokeLinecap="round" />
                </svg>
              </div>

              <h3>Your Wishlist is Empty</h3>
              <p className="empty-wishlist-copy">Pick your top paint and tools, then come back to keep your favorites handy for later.</p>

              <Button text="Continue Shopping" className="btn btn-primary" onClick={() => navigate("/shop")} />
            </div>
          ) : (
            <div className="products-grid wishlist-grid">
              {wishlist.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  product={product}
                  isWishlist={true}
                  removeFromWishlist={handleRemoveFromWishlist}
                  addToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}