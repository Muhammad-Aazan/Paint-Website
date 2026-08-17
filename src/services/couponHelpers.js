// Coupon helper utility for Drip Paints

const defaultCoupons = [
  {
    code: "DRIP10",
    type: "percentage",
    value: 10,
    minSpend: 1000,
    description: "10% off on all interior and exterior paints",
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    minSpend: 1500,
    description: "20% welcome discount on first order",
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    code: "PAINTER500",
    type: "flat",
    value: 500,
    minSpend: 3000,
    description: "Flat Rs. 500 off on bulk orders above Rs. 3,000",
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    code: "FREESHIP",
    type: "flat",
    value: 200,
    minSpend: 500,
    description: "Rs. 200 Express Shipping Credit",
    isActive: true,
    created_at: new Date().toISOString(),
  },
];

export function getAllCoupons() {
  try {
    const custom = JSON.parse(localStorage.getItem("drip_coupons_db") || "[]");
    const merged = new Map();
    // Default coupons
    defaultCoupons.forEach((c) => merged.set(c.code.toUpperCase(), c));
    // Overlay custom admin coupons
    custom.forEach((c) => merged.set(c.code.toUpperCase(), c));
    return Array.from(merged.values());
  } catch {
    return defaultCoupons;
  }
}

export function saveCoupon(coupon) {
  const current = getAllCoupons();
  const cleanCode = coupon.code.trim().toUpperCase();

  const newCoupon = {
    ...coupon,
    code: cleanCode,
    type: coupon.type || "percentage",
    value: Number(coupon.value) || 10,
    minSpend: Number(coupon.minSpend) || 0,
    isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    description: coupon.description || `${coupon.value}${coupon.type === "percentage" ? "%" : " Rs"} Discount`,
    created_at: new Date().toISOString(),
  };

  const updated = [newCoupon, ...current.filter((c) => c.code !== cleanCode)];
  localStorage.setItem("drip_coupons_db", JSON.stringify(updated));

  // Broadcast coupon update
  try {
    if ("BroadcastChannel" in window) {
      new BroadcastChannel("drip_orders_realtime").postMessage({
        type: "COUPONS_UPDATED",
        payload: updated,
      });
    }
  } catch (e) {
    console.warn("Coupon broadcast error:", e);
  }

  return newCoupon;
}

export function deleteCoupon(code) {
  const cleanCode = code.trim().toUpperCase();
  const current = getAllCoupons();
  const updated = current.filter((c) => c.code !== cleanCode);
  localStorage.setItem("drip_coupons_db", JSON.stringify(updated));
  return true;
}

export function toggleCouponStatus(code) {
  const cleanCode = code.trim().toUpperCase();
  const current = getAllCoupons();
  const updated = current.map((c) => {
    if (c.code === cleanCode) {
      return { ...c, isActive: !c.isActive };
    }
    return c;
  });
  localStorage.setItem("drip_coupons_db", JSON.stringify(updated));
  return true;
}

export function validateAndApplyCoupon(inputCode, subtotal) {
  if (!inputCode || !inputCode.trim()) {
    return { isValid: false, error: "Please enter a coupon code." };
  }

  const cleanCode = inputCode.trim().toUpperCase();
  const coupons = getAllCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return {
      isValid: false,
      error: `Coupon "${cleanCode}" is invalid. Try DRIP10, WELCOME20, or check Admin active coupons.`,
    };
  }

  if (!coupon.isActive) {
    return {
      isValid: false,
      error: `Coupon "${cleanCode}" is currently inactive or expired.`,
    };
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      isValid: false,
      error: `Minimum order spend of Rs. ${coupon.minSpend.toLocaleString()} required for this coupon. Your subtotal is Rs. ${subtotal.toLocaleString()}.`,
    };
  }

  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = Math.round((subtotal * coupon.value) / 100);
  } else {
    discountAmount = Math.min(subtotal, Number(coupon.value));
  }

  return {
    isValid: true,
    discountAmount,
    coupon,
    label: `${coupon.code} (${coupon.type === "percentage" ? `${coupon.value}% OFF` : `Rs. ${coupon.value} OFF`})`,
  };
}
