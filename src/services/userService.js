import api from './api';

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    return api.get('/api/v1/user/profile');
  },

  /**
   * Update user profile
   * @param {Object} data - Profile update data (fullName, gender, phoneNumber, bio)
   */
  updateProfile: async (data) => {
    return api.put('/api/v1/user/profile', {
      fullName: data.fullName,
      gender: data.gender || null,
      phoneNumber: data.phoneNumber || data.phone || null,
      bio: data.bio || null,
    });
  },

  /**
   * Change password
   * @param {Object} data - Password change data (currentPassword, newPassword, confirmNewPassword)
   */
  changePassword: async (data) => {
    return api.post('/api/v1/user/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    });
  },

  /**
   * Upload avatar
   * @param {File} file - Avatar file
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type header - let axios handle it with proper boundary
    return api.post('/api/v1/user/avatar', formData);
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async () => {
    return api.delete('/api/v1/user/avatar');
  },
};
