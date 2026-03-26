import { mockCourses, mockInstructorCourses } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const courseService = {
  // Get all courses
  getAll: async (params) => {
    await delay(300);
    const page = params?.page || 0;
    const size = params?.size || 12;
    const start = page * size;
    const data = mockCourses.slice(start, start + size);
    return { data: { content: data, totalElements: mockCourses.length } };
  },

  // Get course by ID
  getById: async (id) => {
    await delay(200);
    const course = mockCourses.find(c => c.id === id);
    if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    return { data: course };
  },

  // Get course by slug
  getBySlug: async (slug) => {
    await delay(200);
    const course = mockCourses.find(c => c.slug === slug);
    if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    return { data: course };
  },

  // Create new course
  create: async (data) => {
    await delay(300);
    if (!data.title || !data.description) {
      throw { response: { data: { message: 'Vui lòng nhập đầy đủ thông tin' } } };
    }
    const newCourse = {
      id: `course-${Date.now()}`,
      title: data.title,
      description: data.description,
      slug: data.title.toLowerCase().replace(/\s+/g, '-'),
      categoryId: data.categoryId,
      level: data.level || 'BEGINNER',
      price: data.price || 0,
      originalPrice: data.originalPrice || 0,
      image: data.image || 'https://picsum.photos/400/225?random=' + Math.random(),
      instructor: data.instructor,
      status: 'DRAFT',
      rating: 0,
      reviews: 0,
      students: 0,
      duration: '0 giờ',
      lessons: 0,
      videos: 0,
      resources: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      content: [],
    };
    mockCourses.push(newCourse);
    return { data: newCourse };
  },

  // Update course
  update: async (id, data) => {
    await delay(300);
    const course = mockCourses.find(c => c.id === id);
    if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    const updated = { ...course, ...data, updatedAt: new Date().toISOString().split('T')[0] };
    const index = mockCourses.findIndex(c => c.id === id);
    mockCourses[index] = updated;
    return { data: updated };
  },

  // Delete course
  delete: async (id) => {
    await delay(300);
    const index = mockCourses.findIndex(c => c.id === id);
    if (index === -1) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    mockCourses.splice(index, 1);
    return { data: { message: 'Xóa khóa học thành công' } };
  },

  // Search courses
  search: async (data) => {
    await delay(300);
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

    // Sorting
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
    const content = results.slice(start, start + size);

    return { data: { content, totalElements: results.length } };
  },

  // Get popular courses
  getPopular: async () => {
    await delay(200);
    const popular = [...mockCourses].sort((a, b) => b.students - a.students).slice(0, 8);
    return { data: popular };
  },

  // Get newest courses
  getNewest: async () => {
    await delay(200);
    const newest = [...mockCourses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    return { data: newest };
  },

  // Get courses by category
  getByCategory: async (categoryId, params) => {
    await delay(200);
    const filtered = mockCourses.filter(c => c.categoryId === parseInt(categoryId));
    const page = params?.page || 0;
    const size = params?.size || 12;
    const start = page * size;
    return { data: { content: filtered.slice(start, start + size), totalElements: filtered.length } };
  },

  // Get courses by instructor
  getByInstructor: async (instructorId, params) => {
    await delay(200);
    const filtered = mockCourses.filter(c => c.instructorId === instructorId);
    const page = params?.page || 0;
    const size = params?.size || 12;
    const start = page * size;
    return { data: { content: filtered.slice(start, start + size), totalElements: filtered.length } };
  },
};
