import { mockCourses, mockInstructorCourses } from '../utils/mockData';
import api from './api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Map mockCourses data to match CourseCard component expectations
 * mockCourses format → CourseCard format
 */
const formatCourseForCard = (course) => {
  return {
    ...course,
    // Map image → thumbnail
    thumbnail: course.image || course.thumbnail,
    // Map category.name → categoryName
    categoryName: course.category?.name || course.categoryName,
    // Map instructor.fullName → instructorName
    instructorName: course.instructor?.fullName || course.instructor?.name || course.instructorName || 'Unknown Instructor',
    // Map description → shortDescription (truncate to first 100 chars)
    shortDescription: course.description?.substring(0, 100) || course.shortDescription,
    // Map rating → avgRating (if using 'rating' field)
    avgRating: course.rating || course.avgRating,
    // Map discountPrice if price has discount
    discountPrice: course.originalPrice && course.price ? course.price : undefined,
  };
};

export const courseService = {
  // Get all courses
  getAll: async (params) => {
    try {
      const page = params?.page || 0;
      const size = params?.size || 12;
      console.log('[courseService.getAll] Fetching from backend API...');
      const response = await api.get(`/api/v1/courses?page=${page}&size=${size}`);
      
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;
      
      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getAll] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getAll] API error, using mock data:', error);
      const page = params?.page || 0;
      const size = params?.size || 12;
      const start = page * size;
      const data = mockCourses.slice(start, start + size).map(formatCourseForCard);
      return { data: { content: data, totalElements: mockCourses.length } };
    }
  },

  // Get course by ID
  getById: async (id) => {
    try {
      console.log('[courseService.getById] Fetching from backend API:', id);
      const response = await api.get(`/api/v1/courses/${id}`);
      const course = response.data?.data || response.data;
      const result = formatCourseForCard(course);
      console.log('[courseService.getById] Result:', result.id);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getById] API error, using mock data:', error);
      const course = mockCourses.find(c => c.id === id);
      if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
      return { data: formatCourseForCard(course) };
    }
  },

  // Get course by slug
  getBySlug: async (slug) => {
    try {
      console.log('[courseService.getBySlug] Fetching from backend API:', slug);
      const response = await api.get(`/api/v1/courses/slug/${slug}`);
      const course = response.data?.data || response.data;
      const result = formatCourseForCard(course);
      console.log('[courseService.getBySlug] Result:', result.id);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getBySlug] API error, using mock data:', error);
      const course = mockCourses.find(c => c.slug === slug);
      if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
      return { data: formatCourseForCard(course) };
    }
  },

  // Create new course
  create: async (data) => {
    try {
      console.log('[courseService.create] Creating course via backend API...');
      const response = await api.post('/api/v1/courses', data);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.create] API error:', error);
      throw error;
    }
  },

  // Update course
  update: async (id, data) => {
    try {
      console.log('[courseService.update] Updating course via backend API:', id);
      const response = await api.put(`/api/v1/courses/${id}`, data);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.update] API error:', error);
      throw error;
    }
  },

  // Delete course
  delete: async (id) => {
    try {
      console.log('[courseService.delete] Deleting course via backend API:', id);
      const response = await api.delete(`/api/v1/courses/${id}`);
      return { data: response.data?.data || response.data || { message: 'Xóa khóa học thành công' } };
    } catch (error) {
      console.error('[courseService.delete] API error:', error);
      throw error;
    }
  },

  // Search courses
  search: async (data) => {
    console.log('[courseService.search] Called with filters:', data);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (data.categoryId) params.append('categoryId', data.categoryId);
      if (data.level) params.append('level', data.level);
      if (data.priceMin !== undefined) params.append('priceMin', data.priceMin);
      if (data.priceMax !== undefined) params.append('priceMax', data.priceMax);
      if (data.sort) params.append('sort', data.sort);
      params.append('page', data.page || 0);
      params.append('size', data.size || 12);

      console.log('[courseService.search] Calling backend API:', `/api/v1/courses/search?${params.toString()}`);
      const response = await api.get(`/api/v1/courses/search?${params.toString()}`);
      
      console.log('[courseService.search] API response:', response);
      
      // Handle response format: { success, code, data: { content, totalElements } }
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;
      
      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.search] Formatted result:', { content: content.length, total: totalElements });
      
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.search] API error, falling back to mock data:', error);
      // Fallback to mock data
      let results = [...mockCourses];

      if (data.categoryId) {
        results = results.filter(c => c.categoryId === parseInt(data.categoryId));
      }
      if (data.level) {
        results = results.filter(c => c.level === data.level);
      }
      if (data.priceMin !== undefined) {
        results = results.filter(c => c.price >= data.priceMin);
      }
      if (data.priceMax !== undefined) {
        results = results.filter(c => c.price <= data.priceMax);
      }

      if (data.sort === 'popular') {
        results.sort((a, b) => b.students - a.students);
      } else if (data.sort === 'newest') {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (data.sort === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }

      const page = data.page || 0;
      const size = data.size || 12;
      const start = page * size;
      const content = results.slice(start, start + size).map(formatCourseForCard);

      return { data: { content, totalElements: results.length } };
    }
  },

  // Get popular courses
  getPopular: async () => {
    try {
      console.log('[courseService.getPopular] Fetching from backend API...');
      const response = await api.get('/api/v1/courses/popular?size=8');
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || pageData || [];
      const result = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getPopular] Result:', result.length);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getPopular] API error, using mock data:', error);
      const popular = [...mockCourses].sort((a, b) => b.students - a.students).slice(0, 8).map(formatCourseForCard);
      return { data: popular };
    }
  },

  // Get newest courses
  getNewest: async () => {
    try {
      console.log('[courseService.getNewest] Fetching from backend API...');
      const response = await api.get('/api/v1/courses/newest?size=4');
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || pageData || [];
      const result = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getNewest] Result:', result.length);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getNewest] API error, using mock data:', error);
      const newest = [...mockCourses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map(formatCourseForCard);
      return { data: newest };
    }
  },

  // Get courses by category
  getByCategory: async (categoryId, params) => {
    try {
      const page = params?.page || 0;
      const size = params?.size || 12;
      console.log('[courseService.getByCategory] Fetching from backend API:', categoryId);
      const response = await api.get(`/api/v1/courses/category/${categoryId}?page=${page}&size=${size}`);
      
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;
      
      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getByCategory] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getByCategory] API error, using mock data:', error);
      const filtered = mockCourses.filter(c => c.categoryId === parseInt(categoryId));
      const page = params?.page || 0;
      const size = params?.size || 12;
      const start = page * size;
      return { data: { content: filtered.slice(start, start + size).map(formatCourseForCard), totalElements: filtered.length } };
    }
  },

  // Get courses by instructor
  getByInstructor: async (instructorId, params) => {
    try {
      const page = params?.page || 0;
      const size = params?.size || 12;
      console.log('[courseService.getByInstructor] Fetching from backend API:', instructorId);
      const response = await api.get(`/api/v1/courses/instructor/${instructorId}?page=${page}&size=${size}`);
      
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;
      
      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getByInstructor] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getByInstructor] API error, using mock data:', error);
      const filtered = mockCourses.filter(c => c.instructorId === instructorId);
      const page = params?.page || 0;
      const size = params?.size || 12;
      const start = page * size;
      return { data: { content: filtered.slice(start, start + size).map(formatCourseForCard), totalElements: filtered.length } };
    }
  },
};
