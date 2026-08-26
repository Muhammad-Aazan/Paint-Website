import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  isDrawerOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      // price is always stored as a raw number now (e.g. 10000)
      const priceNumber = typeof product.price === "number"
        ? product.price
        : Number(String(product.price || 0).replace(/[^0-9]+/g, "")) || 0;

      const existing = state.items.find((i) => String(i.id) === String(product.id));

      if (existing) {
        existing.quantity += (product.quantity || 1);
      } else {
        state.items.push({
          id: product.id,
          image: product.image,
          category: product.category,
          name: product.name,
          price: product.price,
          unit: product.unit,
          rating: product.rating,
          reviews: product.reviews,
          quantity: product.quantity || 1,
          priceNumber,
        });
      }
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => String(i.id) !== String(id));
    },

    increaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => String(i.id) === String(id));
      if (item) item.quantity += 1;
    },

    decreaseQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find((i) => String(i.id) === String(id));
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => String(i.id) !== String(id));
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
    setCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
    openDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCart,
  openDrawer,
  closeDrawer,
  toggleDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
