import api from './api';

export const reviewService = {
  /**
   * Create a review for a course
   * @param {string} courseId - Course ID
   * @param {object} data - Review data { rating, comment }
   * @returns Response with review data
   */
  create: async (courseId, data) => {
    try {
      console.log('[reviewService.create] Creating review for course:', courseId);
      const response = await api.post(`/api/v1/courses/${courseId}/reviews`, {
        rating: data.rating,
        comment: data.comment || '',
      });
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.create] Error:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a course (paginated, public reviews)
   * @param {string} courseId - Course ID
   * @param {object} params - Pagination params { page, size }
   * @returns Response with list of reviews
   */
  getByCourse: async (courseId, params) => {
    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || params?.size || 10;
      console.log('[reviewService.getByCourse] Fetching reviews for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/reviews`, {
        params: { page, pageSize },
      });
      const data = response.data?.data || response.data;
      return { data: data };
    } catch (error) {
      console.error('[reviewService.getByCourse] Error:', error);
      throw error;
    }
  },

  /**
   * Get current student's review for a course
   * @param {string} courseId - Course ID
   * @returns Response with review data or null
   */
  getMyReview: async (courseId) => {
    try {
      console.log('[reviewService.getMyReview] Fetching my review for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/reviews/me`, {
        suppressErrorLog: true, // 404 is expected when no review exists
        validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
      });
      if (response.status === 404) {
        return { data: null };
      }
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.getMyReview] Error:', error);
      throw error;
    }
  },

  /**
   * Update current student's review for a course
   * @param {string} courseId - Course ID
   * @param {object} data - Update data { rating, comment }
   * @returns Response with updated review
   */
  updateMyReview: async (courseId, data) => {
    try {
      console.log('[reviewService.updateMyReview] Updating my review for course:', courseId);
      const response = await api.put(`/api/v1/courses/${courseId}/reviews/me`, {
        rating: data.rating,
        comment: data.comment || '',
      });
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.updateMyReview] Error:', error);
      throw error;
    }
  },

  /**
   * Delete current student's review for a course
   * @param {string} courseId - Course ID
   * @returns Response
   */
  deleteMyReview: async (courseId) => {
    try {
      console.log('[reviewService.deleteMyReview] Deleting my review for course:', courseId);
      const response = await api.delete(`/api/v1/courses/${courseId}/reviews/me`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.deleteMyReview] Error:', error);
      throw error;
    }
  },

  /**
   * Reply to a student review (instructor/admin only)
   * @param {string} courseId - Course ID
   * @param {string} reviewId - Review ID
   * @param {object} data - Reply data { reply }
   * @returns Response with updated review
   */
  replyReview: async (courseId, reviewId, data) => {
    try {
      console.log('[reviewService.replyReview] Replying to review:', reviewId);
      const response = await api.post(
        `/api/v1/courses/${courseId}/reviews/${reviewId}/reply`,
        {
          reply: data.reply,
        }
      );
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[reviewService.replyReview] Error:', error);
      throw error;
    }
  },

  /**
   * Get course rating statistics
   * @param {string} courseId - Course ID
   * @returns Response with rating stats
   */
  getRatingStats: async (courseId) => {
    try {
      console.log('[reviewService.getRatingStats] Fetching stats for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/reviews`, {
        params: { page: 1, pageSize: 100 },
      });
      const pageData = response.data?.data || response.data;
      const reviews = Array.isArray(pageData) ? pageData : pageData?.content || [];
      const totalReviews = pageData?.totalElements ?? reviews.length;
      const ratingSum = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
      return {
        data: {
          totalReviews,
          avgRating: reviews.length > 0 ? ratingSum / reviews.length : 0,
        },
      };
    } catch (error) {
      console.error('[reviewService.getRatingStats] Error:', error);
      throw error;
    }
  },
};
