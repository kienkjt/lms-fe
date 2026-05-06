import api from './api';

export const notificationService = {
  /**
   * Get all notifications for current user
   * @param {object} params - Pagination params { page, size }
   * @returns Response with list of notifications
   */
  getAll: async (params) => {
    try {
      const page = params?.page ?? 0;
      const size = params?.size || 10;
      console.log('[notificationService.getAll] Fetching notifications');
      const response = await api.get(`/api/v1/notifications?page=${page}&size=${size}`);
      const data = response.data?.data || response.data;
      return { data };
    } catch (error) {
      console.error('[notificationService.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns Response with updated notification
   */
  markRead: async (id) => {
    const response = await api.post(`/api/v1/notifications/${id}/read`);
    return { data: response.data?.data || response.data };
  },

  /**
   * Mark all notifications as read
   * @returns Response
   */
  markAllRead: async () => {
    try {
      console.log('[notificationService.markAllRead] Marking all notifications as read');
      const response = await api.post('/api/v1/notifications/read-all');
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.warn('[notificationService.markAllRead] Fallback endpoint /mark-all-read');
      try {
        const fallback = await api.post('/api/v1/notifications/mark-all-read');
        return { data: fallback.data?.data || fallback.data };
      } catch (fallbackError) {
        console.error('[notificationService.markAllRead] Error:', fallbackError);
        throw fallbackError;
      }
    }
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns Response
   */
  delete: async (id) => {
    try {
      console.log('[notificationService.delete] Deleting notification:', id);
      const response = await api.delete(`/api/v1/notifications/${id}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[notificationService.delete] Error:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns Response with count
   */
  getUnreadCount: async () => {
    try {
      console.log('[notificationService.getUnreadCount] Fetching unread count');
      const response = await api.get('/api/v1/notifications/unread-count');
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[notificationService.getUnreadCount] Error:', error);
      throw error;
    }
  },

  /**
   * Create a notification for a user (admin only)
   * @param {object} data - CreateNotificationRequestDto
   */
  create: async (data) => {
    try {
      console.log('[notificationService.create] Creating notification');
      const response = await api.post('/api/v1/notifications', data);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[notificationService.create] Error:', error);
      throw error;
    }
  },
};
