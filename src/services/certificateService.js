import api from './api';

/**
 * Certificate Service - Manage student certificates
 */
export const certificateService = {
  /**
   * Get current user's all certificates
   * @returns {Promise} Response with list of CertificateResponseDto
   */
  getMyCertificates: async () => {
    try {
      console.log('[certificateService.getMyCertificates] Fetching my certificates');
      const response = await api.get('/v1/certificates/my');
      const certificates = response.data?.data || response.data || [];
      console.log('[certificateService.getMyCertificates] Success, found:', certificates.length);
      return { data: certificates };
    } catch (error) {
      console.error('[certificateService.getMyCertificates] Error:', error);
      throw error;
    }
  },

  /**
   * Get current user's certificate for a specific course
   * @param {string} courseId - Course ID
   * @returns {Promise} Response with CertificateResponseDto
   */
  getMyCertificateForCourse: async (courseId) => {
    try {
      console.log('[certificateService.getMyCertificateForCourse] Fetching certificate for course:', courseId);
      const response = await api.get(`/v1/certificates/courses/${courseId}`);
      const certificate = response.data?.data || response.data;
      console.log('[certificateService.getMyCertificateForCourse] Success');
      return { data: certificate };
    } catch (error) {
      console.error('[certificateService.getMyCertificateForCourse] Error:', error);
      throw error;
    }
  },

  /**
   * Get certificate details by certificate ID
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} Response with CertificateResponseDto
   */
  getCertificate: async (certificateId) => {
    try {
      console.log('[certificateService.getCertificate] Fetching certificate:', certificateId);
      const response = await api.get(`/v1/certificates/${certificateId}`);
      const certificate = response.data?.data || response.data;
      console.log('[certificateService.getCertificate] Success');
      return { data: certificate };
    } catch (error) {
      console.error('[certificateService.getCertificate] Error:', error);
      throw error;
    }
  },

  /**
   * Download certificate PDF
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} Response with PDF file
   */
  downloadCertificate: async (certificateId) => {
    try {
      console.log('[certificateService.downloadCertificate] Downloading certificate:', certificateId);
      const response = await api.get(`/v1/certificates/${certificateId}/download`, {
        responseType: 'blob',
      });
      console.log('[certificateService.downloadCertificate] Success');
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { data: response.data };
    } catch (error) {
      console.error('[certificateService.downloadCertificate] Error:', error);
      throw error;
    }
  },

  /**
   * Get certificate PDF URL for viewing/embedding
   * @param {string} certificateId - Certificate ID
   * @returns {string} PDF URL
   */
  getCertificatePdfUrl: (certificateId) => {
    return `/v1/certificates/${certificateId}/download`;
  },
};
