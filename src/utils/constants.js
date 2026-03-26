export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'EduLearn LMS';

export const ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
};

export const COURSE_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
};

export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const TOKEN_KEY = 'lms_access_token';
export const REFRESH_TOKEN_KEY = 'lms_refresh_token';
export const USER_KEY = 'lms_user';

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 12,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:slug',
  SEARCH: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES: '/student/courses',
  LEARNING: '/learn/:courseId',
  INSTRUCTOR_DASHBOARD: '/instructor/dashboard',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_CREATE_COURSE: '/instructor/courses/create',
  INSTRUCTOR_EDIT_COURSE: '/instructor/courses/edit/:courseId',
  INSTRUCTOR_COURSE_DETAIL: '/instructor/courses/:courseId',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
};
