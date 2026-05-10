import { ROLES, hasRole } from "./constants";

const normalizeComparableValue = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim().toLowerCase();
};

const pickFirstValue = (...values) => {
  for (const value of values) {
    const normalized = normalizeComparableValue(value);
    if (normalized) return normalized;
  }

  return "";
};

const getUserId = (user) =>
  pickFirstValue(
    user?.id,
    user?.userId,
    user?.accountId,
    user?.uuid,
    user?.profileId,
  );

const getCourseInstructorId = (courseLike) => {
  const course = courseLike?.course || courseLike;
  const instructor = course?.instructor || courseLike?.instructor;

  return pickFirstValue(
    courseLike?.instructorId,
    courseLike?.teacherId,
    courseLike?.ownerId,
    courseLike?.authorId,
    courseLike?.createdById,
    course?.instructorId,
    course?.teacherId,
    course?.ownerId,
    course?.authorId,
    course?.createdById,
    instructor?.id,
    instructor?.userId,
    instructor?.accountId,
  );
};

const getUserEmail = (user) => normalizeComparableValue(user?.email);

const getCourseInstructorEmail = (courseLike) => {
  const course = courseLike?.course || courseLike;
  const instructor = course?.instructor || courseLike?.instructor;

  return pickFirstValue(
    courseLike?.instructorEmail,
    course?.instructorEmail,
    instructor?.email,
  );
};

export const isCourseOwnedByUser = (user, courseLike) => {
  const userId = getUserId(user);
  const instructorId = getCourseInstructorId(courseLike);

  if (userId && instructorId && userId === instructorId) {
    return true;
  }

  const userEmail = getUserEmail(user);
  const instructorEmail = getCourseInstructorEmail(courseLike);

  return Boolean(userEmail && instructorEmail && userEmail === instructorEmail);
};

export const isOwnInstructorCourse = (user, courseLike) =>
  hasRole(user?.role, [ROLES.INSTRUCTOR]) &&
  isCourseOwnedByUser(user, courseLike);

export const OWN_COURSE_ACTION_MESSAGE =
  "Giang vien khong the thuc hien thao tac nay voi khoa hoc cua chinh minh.";

export const OWN_COURSE_CHECKOUT_MESSAGE =
  "Gio hang co khoa hoc cua chinh ban. Vui long xoa khoa hoc do truoc khi thanh toan.";
