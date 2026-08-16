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

export async function createOrderInSupabase(userId, cartItems, totalAmount, shippingDetails = {}) {
  const orderNum = "DRIP-" + Math.floor(100000 + Math.random() * 900000);
  const targetUserId = isUuid(userId) ? userId : null;

  const orderPayload = {
    user_id: targetUserId,
    order_number: orderNum,
    subtotal: totalAmount,
    shipping: 0,
    discount: 0,
    total: totalAmount,
    payment_method: shippingDetails.paymentMethod || "cod",
    payment_status: "pending",
    order_status: "pending",
    shipping_address: shippingDetails.address || "",
    city: shippingDetails.city || "Karachi",
    postal_code: shippingDetails.postalCode || "",
    notes: shippingDetails.notes || "",
  };

  let orderData = null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (error) throw error;
    orderData = data;
  } catch (err) {
    console.warn("createOrderInSupabase error:", err.message);
  }

  // Insert into order_items (matched to order_id, product_id, quantity, price)
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

  return orderData || { id: orderNum, order_number: orderNum, total: totalAmount, order_status: "pending" };
}

/* ==========================================================================
   INQUIRIES & BOOKINGS HELPERS
   ========================================================================== */

export async function createInquiry(inquiryData) {
  try {
    const { data, error } = await supabase.from("inquiries").insert(inquiryData).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("createInquiry fallback:", err.message);
    return { ...inquiryData, id: Date.now(), created_at: new Date().toISOString() };
  }
}

export async function fetchAllInquiries() {
  try {
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("fetchAllInquiries fallback:", err.message);
    return [];
  }
}

export async function updateInquiryStatus(id, status) {
  try {
    const { data, error } = await supabase.from("inquiries").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("updateInquiryStatus warning:", err.message);
    return null;
  }
}

export async function createBooking(bookingData) {
  try {
    const { data, error } = await supabase.from("bookings").insert(bookingData).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("createBooking fallback:", err.message);
    return { ...bookingData, id: Date.now(), created_at: new Date().toISOString() };
  }
}

export async function fetchAllBookings() {
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("fetchAllBookings fallback:", err.message);
    return [];
  }
}

export async function updateBookingStatus(id, status) {
  try {
    const { data, error } = await supabase.from("bookings").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("updateBookingStatus warning:", err.message);
    return null;
  }
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
    description: product.description || "",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    image_url: product.image_url || product.image || "",
    rating: Number(product.rating) || 5,
    reviews_count: Number(product.reviews) || 0,
    active: true,
  };

  const { data, error } = await supabase.from("products").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const payload = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name) payload.name = updates.name;
  if (updates.price !== undefined) payload.price = Number(updates.price) || 0;
  if (updates.stock !== undefined) payload.stock = Number(updates.stock) || 0;
  if (updates.image_url) payload.image_url = updates.image_url;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.reviews !== undefined) payload.reviews_count = Number(updates.reviews) || 0;

  const { data, error } = await supabase.from("products").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { data, error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return data;
}

export async function fetchAllOrders() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (orders || []).map((o) => ({
      ...o,
      status: o.order_status || o.status || "pending",
      total_amount: o.total || o.total_amount || 0,
      order_number: o.order_number || `#${String(o.id).slice(0, 8)}`,
    }));
  } catch (err) {
    console.warn("fetchAllOrders error:", err.message);
    return [];
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId)
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("updateOrderStatus error:", err.message);
    return null;
  }
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
