import api from './api';

export const cartService = {
  getCart: async () => {
    try {
      console.log('[cartService.getCart] Fetching cart from backend');
      const response = await api.get('/api/v1/cart');
      const cart = response.data?.data || response.data;
      console.log('[cartService.getCart] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.getCart] API error:', error);
      throw error;
    }
  },

  addItem: async (courseId) => {
    try {
      console.log('[cartService.addItem] Adding course to cart:', courseId);
      const response = await api.post('/api/v1/cart/add', { courseId });
      const cart = response.data?.data || response.data;
      console.log('[cartService.addItem] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.addItem] API error:', error);
      throw error;
    }
  },

  removeItem: async (cartItemId) => {
    try {
      console.log('[cartService.removeItem] Removing from cart:', cartItemId);
      const response = await api.delete(`/api/v1/cart/items/${cartItemId}`);
      const cart = response.data?.data || response.data;
      console.log('[cartService.removeItem] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.removeItem] API error:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      console.log('[cartService.clearCart] Clearing cart');
      const response = await api.delete('/api/v1/cart/clear');
      console.log('[cartService.clearCart] Success');
      const cart = response.data?.data || response.data || { id: null, totalAmount: 0, items: [] };
      return { data: cart };
    } catch (error) {
      console.error('[cartService.clearCart] API error:', error);
      throw error;
    }
  },
};
