import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import store from "./store/store";
import { ROUTES, ROLES } from "./utils/constants";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Common
import ProtectedRoute from "./components/common/ProtectedRoute";
import { PageLoader } from "./components/common/Loading";

// Auth Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyOtp from "./components/auth/VerifyOtp";
import ForgotPassword from "./components/auth/ForgotPassword";

// Public Pages
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import {
  NotFoundPage,
  UnauthorizedPage,
  ServerErrorPage,
} from "./pages/ErrorPages";

// Protected Pages (Lazy)
const StudentDashboard = lazy(() => import("./components/student/Dashboard"));
const InstructorDashboard = lazy(
  () => import("./components/instructor/Dashboard"),
);
const CoursesManagement = lazy(
  () => import("./components/instructor/CoursesManagement"),
);
const CreateCourse = lazy(() => import("./components/instructor/CreateCourse"));
const Cart = lazy(() => import("./components/cart/Cart"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));

import "./index.css";
import "./App.css";

// Wrappers for layout composition
const WithMainLayout = ({ children }) => <MainLayout>{children}</MainLayout>;
const WithDashboard = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Auth pages (no layout) ── */}
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtp />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

            {/* ── Public (MainLayout) ── */}
            <Route
              path={ROUTES.HOME}
              element={
                <WithMainLayout>
                  <HomePage />
                </WithMainLayout>
              }
            />
            <Route
              path={ROUTES.COURSES}
              element={
                <WithMainLayout>
                  <CoursesPage />
                </WithMainLayout>
              }
            />
            <Route
              path={ROUTES.COURSE_DETAIL}
              element={
                <WithMainLayout>
                  <CourseDetailPage />
                </WithMainLayout>
              }
            />
            <Route
              path={ROUTES.SEARCH}
              element={
                <WithMainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <SearchPage />
                  </Suspense>
                </WithMainLayout>
              }
            />

            {/* ── Cart (MainLayout + Auth) ── */}
            <Route
              path={ROUTES.CART}
              element={
                <WithMainLayout>
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <Suspense fallback={<PageLoader />}>
                      <Cart />
                    </Suspense>
                  </ProtectedRoute>
                </WithMainLayout>
              }
            />

            {/* ── Student Dashboard ── */}
            <Route
              path={ROUTES.STUDENT_DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <WithDashboard>
                    <Suspense fallback={<PageLoader />}>
                      <StudentDashboard />
                    </Suspense>
                  </WithDashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.STUDENT_COURSES}
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <WithDashboard>
                    <Suspense fallback={<PageLoader />}>
                      <StudentDashboard />
                    </Suspense>
                  </WithDashboard>
                </ProtectedRoute>
              }
            />

            {/* ── Learning Page ── */}
            <Route
              path={ROUTES.LEARNING}
              element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                  <Suspense fallback={<PageLoader />}>
                    <LearningPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* ── Instructor Dashboard ── */}
            <Route
              path={ROUTES.INSTRUCTOR_DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                  <WithDashboard>
                    <Suspense fallback={<PageLoader />}>
                      <InstructorDashboard />
                    </Suspense>
                  </WithDashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.INSTRUCTOR_COURSES}
              element={
                <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                  <WithDashboard>
                    <Suspense fallback={<PageLoader />}>
                      <CoursesManagement />
                    </Suspense>
                  </WithDashboard>
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.INSTRUCTOR_CREATE_COURSE}
              element={
                <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                  <WithDashboard>
                    <Suspense fallback={<PageLoader />}>
                      <CreateCourse />
                    </Suspense>
                  </WithDashboard>
                </ProtectedRoute>
              }
            />

            {/* ── Profile ── */}
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <WithDashboard>
                    <div style={{ padding: "40px" }}>
                      <h2>Hồ sơ cá nhân - Coming Soon</h2>
                      <p>Chức năng này đang được phát triển.</p>
                    </div>
                  </WithDashboard>
                </ProtectedRoute>
              }
            />

            {/* ── Error Pages ── */}
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 9999 }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
