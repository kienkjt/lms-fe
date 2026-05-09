import api from './api';
import { mockCart } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cartService = {
  /**
   * Get current user's cart
   * @returns Response with CartResponseDto
   */
  getCart: async () => {
    try {
      console.log('[cartService.getCart] Fetching cart from backend');
      const response = await api.get('/v1/cart');
      const cart = response.data?.data || response.data;
      console.log('[cartService.getCart] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.getCart] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      // Return CartResponseDto-shaped fallback
      const items = mockCart.map(item => ({
        id: item.id,
        courseId: item.courseId,
        courseTitle: item.course?.title || item.courseTitle,
        courseThumbnail: item.course?.thumbnail || item.course?.image || item.courseThumbnail,
        instructorName: item.course?.instructorName || item.course?.instructor?.name,
        price: item.course?.discountPrice || item.course?.price || item.price || 0,
        originalPrice: item.course?.originalPrice || item.course?.price || item.originalPrice || 0,
      }));
      const totalAmount = items.reduce((s, it) => s + (it.price || 0), 0);
      return { data: { id: 'mock-cart', totalAmount, items } };
    }
  },

  /**
   * Add course to cart
   * @param {string} courseId - Course ID
   * @returns Response with CartResponseDto
   */
  addItem: async (courseId) => {
    try {
      console.log('[cartService.addItem] Adding course to cart:', courseId);
      const response = await api.post('/v1/cart/add', { courseId });
      const cart = response.data?.data || response.data;
      console.log('[cartService.addItem] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.addItem] API error:', error);
      // Fallback to mock behavior: add item and return CartResponseDto
      await delay(200);
      const course = undefined; // we don't have course detail here in mock fallback
      const cartItem = {
        id: `cart-${Date.now()}`,
        courseId,
        courseTitle: course?.title || `Khóa học ${courseId}`,
        courseThumbnail: course?.thumbnail || null,
        instructorName: course?.instructorName || null,
        price: course?.discountPrice || course?.price || 0,
        originalPrice: course?.originalPrice || course?.price || 0,
      };
      mockCart.push(cartItem);
      const items = mockCart.map(it => ({
        id: it.id,
        courseId: it.courseId,
        courseTitle: it.courseTitle || it.course?.title,
        courseThumbnail: it.courseThumbnail || it.course?.thumbnail,
        instructorName: it.instructorName || it.course?.instructorName,
        price: it.price || (it.course?.discountPrice || it.course?.price) || 0,
        originalPrice: it.originalPrice || it.course?.originalPrice || it.course?.price || 0,
      }));
      const totalAmount = items.reduce((s, it) => s + (it.price || 0), 0);
      return { data: { id: 'mock-cart', totalAmount, items } };
    }
  },

  /**
   * Remove item from cart
   * @param {string} cartItemId - Cart item ID
   * @returns Response with CartResponseDto
   */
  removeItem: async (cartItemId) => {
    try {
      console.log('[cartService.removeItem] Removing from cart:', cartItemId);
      const response = await api.delete(`/v1/cart/items/${cartItemId}`);
      const cart = response.data?.data || response.data;
      console.log('[cartService.removeItem] Success');
      return { data: cart };
    } catch (error) {
      console.error('[cartService.removeItem] API error:', error);
      // Fallback to mock: remove by id and return CartResponseDto
      await delay(200);
      const index = mockCart.findIndex(item => item.id === cartItemId);
      if (index === -1) throw { response: { status: 404, data: { message: 'Khóa học không có trong giỏ hàng' } } };
      mockCart.splice(index, 1);
      const items = mockCart.map(it => ({
        id: it.id,
        courseId: it.courseId,
        courseTitle: it.courseTitle || it.course?.title,
        courseThumbnail: it.courseThumbnail || it.course?.thumbnail,
        instructorName: it.instructorName || it.course?.instructorName,
        price: it.price || (it.course?.discountPrice || it.course?.price) || 0,
        originalPrice: it.originalPrice || it.course?.originalPrice || it.course?.price || 0,
      }));
      const totalAmount = items.reduce((s, it) => s + (it.price || 0), 0);
      return { data: { id: 'mock-cart', totalAmount, items } };
    }
  },

  /**
   * Clear entire cart
   * @returns Response
   */
  clearCart: async () => {
    try {
      console.log('[cartService.clearCart] Clearing cart');
      const response = await api.delete('/v1/cart/clear');
      console.log('[cartService.clearCart] Success');
      const cart = response.data?.data || response.data || { id: null, totalAmount: 0, items: [] };
      return { data: cart };
    } catch (error) {
      console.error('[cartService.clearCart] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      mockCart.length = 0;
      return { data: { id: 'mock-cart', totalAmount: 0, items: [] } };
    }
  },
};
