import { createSlice } from '@reduxjs/toolkit';

const GUEST_CART_KEY = 'lms_guest_cart';

const loadGuestCart = () => {
  try {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
};

const calculateTotal = (items) =>
  items.reduce(
    (sum, item) =>
      sum +
      (item.price || item.course?.discountPrice || item.course?.price || 0),
    0,
  );

const persistGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const savedGuestCart = !localStorage.getItem('lms_access_token') ? loadGuestCart() : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: savedGuestCart,
    total: calculateTotal(savedGuestCart),
    loading: false,
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.total = action.payload.totalAmount ?? action.payload.total ?? 0;
    },
    addToCart: (state, action) => {
      const exists = state.items.find(i => i.courseId === action.payload.courseId);
      if (!exists) {
        state.items.push({
          id: action.payload.id || `guest-${action.payload.courseId}`,
          ...action.payload,
        });
        state.total = calculateTotal(state.items);
        persistGuestCart(state.items);
      }
    },
    removeFromCart: (state, action) => {
      // action.payload is cartItemId (item.id), not courseId
      state.items = state.items.filter(
        i => i.id !== action.payload && i.courseId !== action.payload,
      );
      state.total = calculateTotal(state.items);
      persistGuestCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      persistGuestCart([]);
    },
    setTotal: (state, action) => { state.total = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setCart, addToCart, removeFromCart, clearCart, setTotal, setLoading } = cartSlice.actions;
export default cartSlice.reducer;
