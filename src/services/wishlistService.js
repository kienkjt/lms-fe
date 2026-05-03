import api from './api';

/**
 * Wishlist Service - Manage student wishlist
 */
export const wishlistService = {
  /**
   * Get current user's wishlist (paginated)
   * @param {object} params - Pagination params { page, pageSize }
   * @returns {Promise} Response with wishlist items
   */
  getWishlist: async (params = {}) => {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      console.log('[wishlistService.getWishlist] Fetching wishlist - page:', page, 'pageSize:', pageSize);
      const response = await api.get(`/api/v1/wishlist?page=${page}&pageSize=${pageSize}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.getWishlist] Error:', error);
      throw error;
    }
  },

  /**
   * Add course to wishlist
   * @param {string} courseId - Course ID to add
   * @returns {Promise} Response with wishlist item containing course details
   */
  add: async (courseId) => {
    try {
      console.log('[wishlistService.add] Adding to wishlist:', courseId);
      const response = await api.post(`/api/v1/wishlist/courses/${courseId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.add] Error:', error);
      throw error;
    }
  },

  /**
   * Remove course from wishlist by course ID
   * @param {string} courseId - Course ID to remove
   * @returns {Promise} Response
   */
  remove: async (courseId) => {
    try {
      console.log('[wishlistService.remove] Removing from wishlist by course ID:', courseId);
      const response = await api.delete(`/api/v1/wishlist/courses/${courseId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.remove] Error:', error);
      throw error;
    }
  },

  /**
   * Remove wishlist item by wishlist ID
   * @param {string} wishlistId - Wishlist item ID to remove
   * @returns {Promise} Response
   */
  removeById: async (wishlistId) => {
    try {
      console.log('[wishlistService.removeById] Removing wishlist item:', wishlistId);
      const response = await api.delete(`/api/v1/wishlist/${wishlistId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.removeById] Error:', error);
      throw error;
    }
  },

  /**
   * Check if course is in wishlist
   * @param {string} courseId - Course ID to check
   * @returns {Promise} Response with { exists: boolean }
   */
  isCourseInWishlist: async (courseId) => {
    try {
      console.log('[wishlistService.isCourseInWishlist] Checking course:', courseId);
      const response = await api.get(`/api/v1/wishlist/courses/${courseId}/exists`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[wishlistService.isCourseInWishlist] Error:', error);
      throw error;
    }
  },
};
