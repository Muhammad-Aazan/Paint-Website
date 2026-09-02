import { supabase } from "./supabase";

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */

function isUuid(str) {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

export function generateValidUuid() {
  return "00000000-0000-4000-8000-" + String(Math.floor(Math.random() * 899999999999) + 100000000000).padStart(12, "0");
}

export function toValidUuid(val) {
  if (!val) return null;
  const str = String(val).trim();
  if (isUuid(str)) return str;
  const cleanHex = str.replace(/[^0-9a-fA-F]/g, "") || "1";
  const padded = cleanHex.padStart(12, "0").slice(-12);
  return `00000000-0000-0000-0000-${padded}`;
}

export async function getRealSupabaseUserId(user) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (e) {
    console.warn("Session fetch warning:", e.message);
  }
  if (user?.id && isUuid(user.id)) return String(user.id);

  let guestUuid = localStorage.getItem("drip_guest_uuid");
  if (!guestUuid || !isUuid(guestUuid)) {
    guestUuid = generateValidUuid();
    localStorage.setItem("drip_guest_uuid", guestUuid);
  }
  return guestUuid;
}

export async function uploadFileToBucket(bucketName, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

/* ==========================================================================
   PROFILES HELPERS
   ========================================================================== */

export async function upsertProfile(profile) {
  const { data, error } = await supabase.from("profiles").upsert(profile, {
    onConflict: "id",
  });
  if (error) throw error;
  return data;
}

export async function fetchUserProfile(userId) {
  if (!userId || !isUuid(userId)) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (err) {
    console.warn("fetchUserProfile warning:", err.message);
    return null;
  }
}

export async function updateUserProfile(userId, updates) {
  if (!userId || !isUuid(userId)) return null;
  const payload = {
    id: userId,
    updated_at: new Date().toISOString(),
    full_name: updates.full_name,
    email: updates.email,
    phone: updates.phone,
    avatar_url: updates.avatar_url,
    city: updates.city,
    address: updates.address,
    username: updates.username,
  };
  const { data, error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;

  // Also sync to Supabase Auth metadata so avatar persists across sessions
  try {
    await supabase.auth.updateUser({
      data: {
        avatar_url: updates.avatar_url,
        full_name: updates.full_name,
        phone: updates.phone,
      },
    });
  } catch (metaErr) {
    console.warn("Auth metadata sync skipped:", metaErr.message);
  }

  return data;
}

export async function changeUserPassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

export async function deleteUserAccountPermanently(userId) {
  // Step 1: Call the server-side RPC function.
  // This SQL function runs with SECURITY DEFINER (admin privileges) and:
  //   - Deletes the user's profile, wishlist, carts rows
  //   - Deletes the user from auth.users permanently
  // Without this RPC, client code cannot touch auth.users.
  //
  // ⚠️  You MUST create this function once in Supabase SQL Editor:
  //
  //   CREATE OR REPLACE FUNCTION delete_user()
  //   RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
  //   BEGIN
  //     DELETE FROM public.profiles WHERE id = auth.uid();
  //     DELETE FROM public.wishlist  WHERE user_id = auth.uid();
  //     DELETE FROM public.carts     WHERE user_id = auth.uid();
  //     DELETE FROM auth.users       WHERE id = auth.uid();
  //   END;
  //   $$;

  try {
    const { error: rpcError } = await supabase.rpc("delete_user");
    if (rpcError) {
      // RPC not created yet — fallback: delete data rows manually, user stays in auth
      console.warn("delete_user RPC not found — falling back to manual data cleanup only.", rpcError.message);
      if (userId) {
        try { await supabase.from("wishlist").delete().eq("user_id", userId); } catch (e) { console.warn(e.message); }
        try { await supabase.from("carts").delete().eq("user_id", userId);    } catch (e) { console.warn(e.message); }
        try { await supabase.from("profiles").delete().eq("id", userId);      } catch (e) { console.warn(e.message); }
      }
    }
  } catch (e) {
    console.warn("deleteUserAccountPermanently RPC error:", e.message);
  }

  // Step 2: Sign out — invalidates the session immediately
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn("Sign out:", e.message);
  }

  // Step 3: Clear all local storage so no stale data remains
  localStorage.removeItem("drip_admin_auth");
  localStorage.removeItem("drip_guest_uuid");
  localStorage.removeItem("drip_custom_admin_passcode");
  localStorage.removeItem("persist:root");
  localStorage.removeItem("drip_orders_db");

  return true;
}


/* ==========================================================================
   WISHLIST HELPERS
   ========================================================================== */

export async function getWishlistFromSupabase(user) {
  const userId = await getRealSupabaseUserId(user);
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", userId);

    if (error) throw error;

    return (data || []).map((item) => {
      const p = item.products || {};
      return {
        id: p.id || item.product_id || item.id,
        name: p.name || item.product_name || item.name || "Paint Product",
        image: p.image_url || p.image || item.product_image || item.image_url || item.image,
        category: p.category_id || item.category || item.product_category || item.category_name || "Product",
        price: p.price || item.product_price || item.price || 0,
        unit: p.unit || item.product_unit || item.unit || "/ piece",
        rating: p.rating || item.product_rating || item.rating || "★★★★★",
        reviews: p.reviews_count || p.reviews || item.product_reviews || item.reviews || "0",
      };
    });
  } catch (err) {
    console.warn("getWishlistFromSupabase warning:", err.message);
    return [];
  }
}

export async function addToWishlistSupabase(user, item) {
  try {
    const userId = await getRealSupabaseUserId(user);
    const validProductId = toValidUuid(item.id);

    // Auto-create guest profile if needed so foreign key doesn't block
    if (isUuid(userId)) {
      try {
        await supabase.from("profiles").upsert(
          { id: userId, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
      } catch (e) {
        console.warn("Guest profile check skipped:", e.message);
      }
    }

    const { data, error } = await supabase.from("wishlist").insert({
      user_id: userId,
      product_id: validProductId,
    }).select();

    if (error) {
      console.warn("addToWishlistSupabase insert error:", error.message);
    } else {
      console.log("Successfully inserted to Supabase wishlist:", data);
    }
    return data;
  } catch (err) {
    console.error("addToWishlistSupabase error:", err.message);
  }
}

export async function syncWishlistToSupabase(user, items) {
  const userId = await getRealSupabaseUserId(user);
  if (!userId || !isUuid(userId)) return;

  try {
    // Ensure profile row exists to avoid FK error
    try {
      await supabase.from("profiles").upsert(
        { id: userId, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    } catch (e) {
      console.warn("Guest profile check skipped:", e.message);
    }

    await supabase.from("wishlist").delete().eq("user_id", userId);

    if (!items || !items.length) return;

    const payload = items
      .map((item) => ({
        user_id: userId,
        product_id: toValidUuid(item.id),
      }))
      .filter((it) => it.product_id !== null);

    if (payload.length) {
      const { data, error } = await supabase.from("wishlist").insert(payload).select();
      if (error) {
        console.warn("syncWishlistToSupabase error:", error.message);
      } else {
        console.log("Wishlist synced to Supabase:", data);
      }
      return data;
    }
  } catch (err) {
    console.error("syncWishlistToSupabase error:", err.message);
  }
}

/* ==========================================================================
   CART HELPERS
   ========================================================================== */

export async function syncCartToSupabase(userId, items) {
  if (!userId || !isUuid(userId)) return;

  try {
    // Ensure profile exists for cart FK
    try {
      await supabase.from("profiles").upsert(
        { id: userId, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    } catch (e) {
      console.warn("Guest profile check skipped:", e.message);
    }

    await supabase.from("carts").upsert(
      {
        user_id: userId,
        items: items,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.warn("Cart sync skipped:", error.message);
  }
}

export async function getCartFromSupabase(userId) {
  if (!userId || !isUuid(userId)) return [];
  try {
    const { data, error } = await supabase.from("carts").select("items").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data?.items || [];
  } catch (error) {
    console.warn("Cart fetch skipped:", error.message);
    return [];
  }
}

/* ==========================================================================
   ORDERS HELPERS (Matched to User Schema)
   ========================================================================== */

// Helper to broadcast order updates across tabs in real-time
function broadcastOrderUpdate(type, payload) {
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("drip_orders_realtime");
      channel.postMessage({ type, payload, timestamp: Date.now() });
    }
  } catch (e) {
    console.warn("Broadcast warning:", e.message);
  }
}

export async function createOrderInSupabase(userId, cartItems, totalAmount, shippingDetails = {}) {
  const orderNum = "DRIP-" + Math.floor(100000 + Math.random() * 900000);
  const targetUserId = isUuid(userId) ? userId : null;

  const shippingFee = Number(shippingDetails.shippingFee) || 0;
  const deliverySpeed = shippingDetails.shippingSpeed || "standard";

  const orderPayload = {
    user_id: targetUserId,
    order_number: orderNum,
    subtotal: totalAmount - shippingFee,
    shipping: shippingFee,
    discount: shippingDetails.discount || 0,
    total: totalAmount,
    delivery_speed: deliverySpeed,
    payment_method: shippingDetails.paymentMethod || "cod",
    payment_status: "pending",
    order_status: "pending", // Initial state is pending approval
    shipping_address: shippingDetails.address || "",
    city: shippingDetails.city || "Karachi",
    postal_code: shippingDetails.postalCode || "",
    notes: shippingDetails.notes || "",
    recipient_name: shippingDetails.fullName || "Valued Customer",
    phone: shippingDetails.phone || "",
    created_at: new Date().toISOString(),
  };

  let orderData = null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (!error && data) {
      orderData = data;
    }
  } catch (err) {
    console.warn("createOrderInSupabase remote error:", err.message);
  }

  // Insert into order_items
  if (orderData?.id && cartItems?.length) {
    try {
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: toValidUuid(item.id),
        quantity: item.quantity || 1,
        price: Number(String(item.price).replace(/[^0-9.-]+/g, "")) || 0,
      }));
      await supabase.from("order_items").insert(orderItems);
    } catch (e) {
      console.warn("order_items insert skipped:", e.message);
    }
  }

  // Deduct product stock in Supabase for each ordered item
  if (cartItems?.length) {
    deductProductsStock(cartItems).catch((err) =>
      console.warn("Stock deduction background warning:", err.message)
    );
  }

  const finalOrder = {
    ...(orderData || orderPayload),
    id: orderData?.id || orderNum,
    order_number: orderData?.order_number || orderNum,
    order_status: "pending",
    items: cartItems,
    created_at: orderPayload.created_at,
  };

  // Sync to local orders cache for instant offline / real-time reflection
  try {
    const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");
    const updatedDb = [finalOrder, ...localDb.filter((o) => o.order_number !== orderNum && o.id !== finalOrder.id)];
    localStorage.setItem("drip_orders_db", JSON.stringify(updatedDb));
  } catch (e) {
    console.warn("Local orders cache error:", e.message);
  }

  // Broadcast creation to open tabs (Admin & Tracker)
  broadcastOrderUpdate("ORDER_CREATED", finalOrder);

  return finalOrder;
}

/* ==========================================================================
   STOCK DEDUCTION HELPER
   ========================================================================== */

export async function deductProductsStock(cartItems) {
  if (!cartItems || !cartItems.length) return;

  for (const item of cartItems) {
    try {
      // Extract raw ID (e.g. "1-4L-CobaltHour" -> "1", or standard UUID / number)
      const rawId = String(item.id).split("-")[0];
      const qtyPurchased = Number(item.quantity) || 1;

      // 1. Try to fetch product from Supabase
      const { data: prod } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", rawId)
        .maybeSingle();

      if (prod) {
        const currentStock = typeof prod.stock === "number" ? prod.stock : 50;
        const newStock = Math.max(0, currentStock - qtyPurchased);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", rawId);
      }

      // 2. Broadcast stock change to open tabs so UI updates instantly
      broadcastOrderUpdate("PRODUCT_STOCK_DEDUCTED", {
        productId: rawId,
        quantityDeducted: qtyPurchased,
      });
    } catch (err) {
      console.warn("Error deducting stock for item:", item.name, err.message);
    }
  }
}

/* ==========================================================================
   CUSTOMER REVIEWS & FEEDBACK HELPERS
   ========================================================================== */

export async function fetchAllReviews() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn("fetchAllReviews remote query warning:", e.message);
  }

  // Fallback to locally stored reviews across all products
  try {
    const allLocalReviews = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("drip_reviews_")) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "[]");
          allLocalReviews.push(...parsed);
        } catch {}
      }
    }
    return allLocalReviews;
  } catch {
    return [];
  }
}

export async function fetchProductReviews(productId) {
  const rawId = String(productId).split("-")[0];
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", rawId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn("fetchProductReviews remote query warning:", e.message);
  }

  // Fallback to locally stored reviews for this product
  try {
    const local = JSON.parse(localStorage.getItem(`drip_reviews_${rawId}`) || "[]");
    return local;
  } catch {
    return [];
  }
}

export async function submitProductReview(productId, { author, rating, comment, userId, verified = true }) {
  const rawId = String(productId).split("-")[0];
  const newReview = {
    id: generateValidUuid(),
    product_id: rawId,
    user_id: userId ? toValidUuid(userId) : null,
    author: author || "Verified Customer",
    rating: Number(rating) || 5,
    comment: comment || "",
    verified: Boolean(verified),
    created_at: new Date().toISOString(),
  };

  let savedReview = newReview;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert(newReview)
      .select()
      .single();

    if (!error && data) {
      savedReview = data;
    }
  } catch (err) {
    console.warn("submitProductReview remote insert warning:", err.message);
  }

  // Save to local cache so user sees it persistently
  try {
    const key = `drip_reviews_${rawId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [savedReview, ...existing.filter((r) => r.id !== savedReview.id)];
    localStorage.setItem(key, JSON.stringify(updated));

    // Update aggregate product reviews count in Supabase products table
    const allRev = updated;
    const avgScore = allRev.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / allRev.length;
    await supabase
      .from("products")
      .update({
        rating: Math.round(avgScore),
        reviews_count: allRev.length,
      })
      .eq("id", rawId);
  } catch (e) {
    console.warn("Local review storage update:", e.message);
  }

  return savedReview;
}

/* ==========================================================================
   INQUIRIES & BOOKINGS HELPERS
   ========================================================================== */

export async function createInquiry(inquiryData) {
  let result = null;
  let savedToDb = false;

  try {
    const { data, error } = await supabase.from("inquiries").insert(inquiryData).select().maybeSingle();
    if (!error && data) {
      result = data;
      savedToDb = true;
    } else if (error) {
      console.warn("createInquiry primary error:", error.message);
      // Attempt simplified payload
      const simplePayload = {
        name: inquiryData.name || inquiryData.full_name || "Customer",
        email: inquiryData.email || "",
        phone: inquiryData.phone || "",
        subject: inquiryData.subject || "General Inquiry",
        message: inquiryData.message || inquiryData.details || "",
        status: inquiryData.status || "pending",
      };
      const retry = await supabase.from("inquiries").insert(simplePayload).select().maybeSingle();
      if (!retry.error && retry.data) {
        result = retry.data;
        savedToDb = true;
      }
    }
  } catch (err) {
    console.warn("createInquiry fallback warning:", err.message);
  }

  const finalInquiry = result || {
    ...inquiryData,
    id: inquiryData.id || `INQ-${Date.now()}`,
    status: inquiryData.status || "pending",
    created_at: inquiryData.created_at || new Date().toISOString(),
    _synced: savedToDb,
  };

  try {
    const existing = JSON.parse(localStorage.getItem("drip_inquiries_db") || "[]");
    const updated = [finalInquiry, ...existing.filter((i) => String(i.id) !== String(finalInquiry.id))];
    localStorage.setItem("drip_inquiries_db", JSON.stringify(updated));

    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("drip_orders_realtime");
      bc.postMessage({ type: "INQUIRY_CREATED", inquiry: finalInquiry });
      bc.close();
    }
  } catch (e) {
    console.warn("Local inquiry save error:", e);
  }

  return finalInquiry;
}

export async function fetchAllInquiries() {
  let dbInquiries = [];
  try {
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      dbInquiries = data;
    }
  } catch (err) {
    console.warn("fetchAllInquiries fallback:", err.message);
  }

  let localInquiries = [];
  try {
    localInquiries = JSON.parse(localStorage.getItem("drip_inquiries_db") || "[]");
  } catch {
    localInquiries = [];
  }

  const map = new Map();
  dbInquiries.forEach((item) => map.set(String(item.id), item));
  localInquiries.forEach((item) => {
    if (!map.has(String(item.id))) {
      map.set(String(item.id), item);
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function updateInquiryStatus(id, status) {
  try {
    await supabase.from("inquiries").update({ status }).eq("id", id);
  } catch (err) {
    console.warn("updateInquiryStatus warning:", err.message);
  }

  try {
    const existing = JSON.parse(localStorage.getItem("drip_inquiries_db") || "[]");
    const updated = existing.map((i) => (String(i.id) === String(id) ? { ...i, status } : i));
    localStorage.setItem("drip_inquiries_db", JSON.stringify(updated));

    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("drip_orders_realtime");
      bc.postMessage({ type: "INQUIRY_STATUS_CHANGED", id, status });
      bc.close();
    }
  } catch (e) {
    console.warn("updateInquiryStatus local error:", e);
  }

  return { id, status };
}

export async function createBooking(bookingData) {
  let result = null;
  let savedToDb = false;

  // Format details with city embedded so no information is ever lost even if schema lacks city column
  const cityTag = bookingData.city ? `[City: ${bookingData.city}]` : "";
  const composedDetails = [cityTag, bookingData.details].filter(Boolean).join(" ");

  // 1. Try full insertion with all columns
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        full_name: bookingData.full_name || bookingData.name || "Customer",
        phone: bookingData.phone || "",
        city: bookingData.city || "Karachi",
        service_required: bookingData.service_required || bookingData.service || "Interior Painting",
        details: bookingData.details || "",
        status: bookingData.status || "pending",
        created_at: bookingData.created_at || new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      result = data;
      savedToDb = true;
    } else if (error) {
      console.warn("createBooking primary schema mismatch, retrying adapted payloads:", error.message);

      // Attempt fallbacks for different schemas:
      // Fallback 1: without 'city' column (store city inside details / notes)
      const payloadWithoutCity = {
        full_name: bookingData.full_name || bookingData.name || "Customer",
        phone: bookingData.phone || "",
        service_required: bookingData.service_required || bookingData.service || "Interior Painting",
        details: composedDetails,
        status: bookingData.status || "pending",
      };

      const retry1 = await supabase.from("bookings").insert(payloadWithoutCity).select().maybeSingle();
      if (!retry1.error && retry1.data) {
        result = { ...retry1.data, city: bookingData.city };
        savedToDb = true;
      } else {
        // Fallback 2: columns 'name', 'phone', 'service', 'notes'
        const payloadAlt2 = {
          name: bookingData.full_name || bookingData.name || "Customer",
          phone: bookingData.phone || "",
          service: bookingData.service_required || bookingData.service || "Interior Painting",
          notes: composedDetails,
          status: bookingData.status || "pending",
        };
        const retry2 = await supabase.from("bookings").insert(payloadAlt2).select().maybeSingle();
        if (!retry2.error && retry2.data) {
          result = { ...retry2.data, full_name: payloadAlt2.name, service_required: payloadAlt2.service, city: bookingData.city, details: composedDetails };
          savedToDb = true;
        }
      }
    }
  } catch (err) {
    console.warn("createBooking supabase network catch:", err.message);
  }

  // 2. Persistently record in local bookings database so Admin Portal always displays it live
  const finalBooking = result || {
    ...bookingData,
    id: bookingData.id || `BK-${Date.now()}`,
    full_name: bookingData.full_name || bookingData.name || "Customer",
    phone: bookingData.phone || "",
    city: bookingData.city || "Karachi",
    service_required: bookingData.service_required || bookingData.service || "Interior Painting",
    details: bookingData.details || "",
    status: bookingData.status || "pending",
    created_at: bookingData.created_at || new Date().toISOString(),
    _synced: savedToDb,
  };

  try {
    const existing = JSON.parse(localStorage.getItem("drip_bookings_db") || "[]");
    const updated = [finalBooking, ...existing.filter((b) => String(b.id) !== String(finalBooking.id))];
    localStorage.setItem("drip_bookings_db", JSON.stringify(updated));

    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("drip_orders_realtime");
      bc.postMessage({ type: "BOOKING_CREATED", booking: finalBooking });
      bc.close();
    }
  } catch (e) {
    console.warn("Local booking save error:", e);
  }

  return finalBooking;
}

export async function fetchAllBookings() {
  let dbBookings = [];
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      dbBookings = data.map((b) => {
        const extractedCity = b.city || b.location || (b.details?.match(/\[City:\s*([^\]]+)\]/)?.[1]) || (b.notes?.match(/\[City:\s*([^\]]+)\]/)?.[1]) || "Karachi";
        const cleanDetails = (b.details || b.notes || b.message || "").replace(/\[City:\s*[^\]]+\]\s*/g, "").trim();
        return {
          id: b.id,
          full_name: b.full_name || b.name || "Customer",
          phone: b.phone || "N/A",
          city: extractedCity,
          service_required: b.service_required || b.service || "Interior Painting",
          details: cleanDetails || b.details || b.notes || "No additional notes",
          status: b.status || "pending",
          created_at: b.created_at || new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn("fetchAllBookings db warning:", err.message);
  }

  let localBookings = [];
  try {
    localBookings = JSON.parse(localStorage.getItem("drip_bookings_db") || "[]");
  } catch {
    localBookings = [];
  }

  const map = new Map();
  dbBookings.forEach((item) => map.set(String(item.id), item));
  localBookings.forEach((item) => {
    if (!map.has(String(item.id))) {
      map.set(String(item.id), item);
    }
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function updateBookingStatus(id, status) {
  try {
    await supabase.from("bookings").update({ status }).eq("id", id);
  } catch (err) {
    console.warn("updateBookingStatus remote warning:", err.message);
  }

  try {
    const existing = JSON.parse(localStorage.getItem("drip_bookings_db") || "[]");
    const updated = existing.map((b) => (String(b.id) === String(id) ? { ...b, status } : b));
    localStorage.setItem("drip_bookings_db", JSON.stringify(updated));

    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("drip_orders_realtime");
      bc.postMessage({ type: "BOOKING_STATUS_CHANGED", id, status });
      bc.close();
    }
  } catch (e) {
    console.warn("updateBookingStatus local error:", e);
  }

  return { id, status };
}

/* ==========================================================================
   ADMIN & MANAGEMENT HELPERS (Matched to User Schema)
   ========================================================================== */

export async function fetchAdminAnalytics() {
  try {
    const [ordersRes, productsRes, profilesRes, inquiriesRes, bookingsRes] = await Promise.all([
      supabase.from("orders").select("id, total, order_status, created_at"),
      supabase.from("products").select("id"),
      supabase.from("profiles").select("id"),
      supabase.from("inquiries").select("id"),
      supabase.from("bookings").select("id"),
    ]);

    const orders = ordersRes.data || [];
    const productsCount = productsRes.data?.length || 0;
    const usersCount = profilesRes.data?.length || 0;
    const inquiriesCount = inquiriesRes.data?.length || 0;
    const bookingsCount = bookingsRes.data?.length || 0;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total || o.total_amount || 0) || 0), 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: productsCount,
      totalUsers: usersCount,
      totalInquiries: inquiriesCount,
      totalBookings: bookingsCount,
      recentOrders: orders.slice(-5).reverse(),
    };
  } catch (err) {
    console.warn("fetchAdminAnalytics fallback:", err.message);
    return {
      totalRevenue: 124500,
      totalOrders: 42,
      totalProducts: 12,
      totalUsers: 18,
      totalInquiries: 5,
      totalBookings: 8,
      recentOrders: [],
    };
  }
}

export async function createProduct(product) {
  const slug = product.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "product";
  const payload = {
    name: product.name,
    slug,
    category: product.category || "Interior Paint",
    unit: product.unit || "/ gallon",
    description: product.description || "",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    image_url: product.image_url || product.image || "",
    rating: Number(product.rating) || 5,
    reviews_count: Number(product.reviews) || 0,
    active: true,
  };

  // Attempt 1: Full payload with category and unit
  let { data, error } = await supabase.from("products").insert(payload).select().maybeSingle();

  // Attempt 2: If column missing (e.g. 'category' or 'unit' or 'stock'), strip missing column and retry
  if (error && (error.message?.includes("category") || error.message?.includes("unit") || error.code === "PGRST204")) {
    console.warn("createProduct schema mismatch, retrying without category/unit columns:", error.message);
    const { category, unit, ...safePayload } = payload;
    const retry = await supabase.from("products").insert(safePayload).select().maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  // Attempt 3: If still error due to stock column
  if (error && (error.message?.includes("stock") || error.code === "PGRST204")) {
    console.warn("createProduct schema mismatch, retrying without stock column:", error.message);
    const { category, unit, stock, ...minimalPayload } = payload;
    const retry = await supabase.from("products").insert(minimalPayload).select().maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("createProduct error:", error);
    throw error;
  }

  return data || payload;
}

export async function updateProduct(id, updates) {
  const payload = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name) payload.name = updates.name;
  if (updates.category) payload.category = updates.category;
  if (updates.unit) payload.unit = updates.unit;
  if (updates.price !== undefined) payload.price = Number(updates.price) || 0;
  if (updates.stock !== undefined) payload.stock = Number(updates.stock) || 0;
  if (updates.image_url) payload.image_url = updates.image_url;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.reviews !== undefined) payload.reviews_count = Number(updates.reviews) || 0;
  if (updates.rating !== undefined) payload.rating = Number(updates.rating) || 5;

  let { data, error } = await supabase.from("products").update(payload).eq("id", id).select().maybeSingle();

  // Fallback if category or unit columns don't exist in Supabase
  if (error && (error.message?.includes("category") || error.message?.includes("unit") || error.code === "PGRST204")) {
    console.warn("updateProduct schema mismatch, retrying without category/unit columns:", error.message);
    const { category, unit, ...safePayload } = payload;
    const retry = await supabase.from("products").update(safePayload).eq("id", id).select().maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error("updateProduct error:", error);
    throw error;
  }

  return data;
}

export async function deleteProduct(id) {
  const { data, error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return data;
}

export async function fetchAllOrders() {
  let remoteOrders = [];
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && orders) {
      remoteOrders = orders.map((o) => ({
        ...o,
        status: o.order_status || o.status || "pending",
        order_status: o.order_status || o.status || "pending",
        total_amount: o.total || o.total_amount || 0,
        order_number: o.order_number || `#${String(o.id).slice(0, 8)}`,
      }));
    }
  } catch (err) {
    console.warn("fetchAllOrders remote error:", err.message);
  }

  // Merge with local orders
  try {
    const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");
    const mergedMap = new Map();
    // Put remote first
    remoteOrders.forEach((o) => mergedMap.set(String(o.order_number || o.id), o));
    // Overlay local (or add new local orders)
    localDb.forEach((o) => {
      const key = String(o.order_number || o.id);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, o);
      } else {
        // If local has more recent status update
        const existing = mergedMap.get(key);
        mergedMap.set(key, { ...existing, ...o, status: o.order_status || o.status || existing.status });
      }
    });

    const result = Array.from(mergedMap.values()).map((o) => ({
      ...o,
      status: o.order_status || o.status || "pending",
      order_status: o.order_status || o.status || "pending",
      total_amount: o.total || o.total_amount || 0,
      order_number: o.order_number || `#${String(o.id).slice(0, 8)}`,
    }));

    return result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } catch {
    return remoteOrders;
  }
}

export async function updateOrderStatus(orderId, status) {
  let updatedRemote = null;
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .or(`id.eq.${orderId.length === 36 ? orderId : "00000000-0000-0000-0000-000000000000"},order_number.eq.${orderId}`)
      .select();

    if (!error) updatedRemote = data;
  } catch (err) {
    console.warn("updateOrderStatus remote error:", err.message);
  }

  // Update local storage
  try {
    const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");
    const updatedDb = localDb.map((ord) => {
      if (String(ord.id) === String(orderId) || String(ord.order_number) === String(orderId)) {
        return { ...ord, order_status: status, status };
      }
      return ord;
    });
    localStorage.setItem("drip_orders_db", JSON.stringify(updatedDb));
  } catch (e) {
    console.warn("Local storage update error:", e.message);
  }

  // Broadcast the update event in real-time
  broadcastOrderUpdate("ORDER_STATUS_CHANGED", { orderId, status });

  return updatedRemote || { id: orderId, order_status: status };
}

export async function fetchAllProfiles() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("fetchAllProfiles error:", err.message);
    return [];
  }
}
