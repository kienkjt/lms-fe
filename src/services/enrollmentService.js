import { mockEnrollments, mockCourses } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const enrollmentService = {
  enroll: async (courseId) => {
    await delay(300);
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    const enrollment = {
      id: `enroll-${Date.now()}`,
      userId: 'user-1',
      courseId,
      course,
      enrolledAt: new Date().toISOString().split('T')[0],
      completedAt: null,
      certificateIssued: false,
      progress: 0,
      lastAccessedAt: new Date().toISOString().split('T')[0],
    };
    mockEnrollments.push(enrollment);
    return { data: enrollment };
  },
  unenroll: async (courseId) => {
    await delay(300);
    const index = mockEnrollments.findIndex(e => e.courseId === courseId);
    if (index === -1) throw { response: { status: 404, data: { message: 'Đăng ký không tìm thấy' } } };
    mockEnrollments.splice(index, 1);
    return { data: { message: 'Hủy đăng ký thành công' } };
  },
  updateProgress: async (courseId, data) => {
    await delay(200);
    const enrollment = mockEnrollments.find(e => e.courseId === courseId);
    if (!enrollment) throw { response: { status: 404, data: { message: 'Đăng ký không tìm thấy' } } };
    enrollment.progress = data.progress || enrollment.progress;
    enrollment.lastAccessedAt = new Date().toISOString().split('T')[0];
    if (enrollment.progress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date().toISOString().split('T')[0];
      enrollment.certificateIssued = true;
    }
    return { data: enrollment };
  },
  getEnrollment: async (courseId) => {
    await delay(200);
    const enrollment = mockEnrollments.find(e => e.courseId === courseId);
    if (!enrollment) throw { response: { status: 404, data: { message: 'Đăng ký không tìm thấy' } } };
    return { data: enrollment };
  },
  getStudentCourses: async (studentId) => {
    await delay(200);
    const courses = mockEnrollments.filter(e => e.userId === studentId);
    return { data: courses };
  },
  getStudentCoursesPaginated: async (studentId, params) => {
    await delay(200);
    const courses = mockEnrollments.filter(e => e.userId === studentId);
    const page = params?.page || 1;
    const size = params?.size || 10;
    const start = (page - 1) * size;
    return { data: { content: courses.slice(start, start + size), totalElements: courses.length } };
  },
  getCourseStudents: async (courseId) => {
    await delay(200);
    const students = mockEnrollments.filter(e => e.courseId === courseId);
    return { data: students };
  },
  getCourseStudentsPaginated: async (courseId, params) => {
    await delay(200);
    const students = mockEnrollments.filter(e => e.courseId === courseId);
    const page = params?.page || 1;
    const size = params?.size || 10;
    const start = (page - 1) * size;
    return { data: { content: students.slice(start, start + size), totalElements: students.length } };
  },
};
