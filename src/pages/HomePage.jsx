import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../services/courseService";
import { categoryService } from "../services/categoryService";
import CourseCard from "../components/courses/CourseCard";
import { SkeletonCard } from "../components/common/Loading";
import { ROUTES } from "../utils/constants";
import {
  FaRocket,
  FaBook,
  FaTrophy,
  FaHeadset,
  FaLaptop,
  FaPalette,
  FaMobileAlt,
  FaChartBar,
  FaGlobe,
  FaFilm,
  FaMusic,
} from "react-icons/fa";
import "./HomePage.css";

const HomePage = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [newestCourses, setNewestCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeError, setHomeError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popularRes, newestRes, catRes] = await Promise.allSettled([
          courseService.getPopular(),
          courseService.getNewest(),
          categoryService.getAll(),
        ]);
        if (popularRes.status === "fulfilled")
          setPopularCourses(popularRes.value.data?.slice(0, 8) || []);
        if (newestRes.status === "fulfilled")
          setNewestCourses(newestRes.value.data?.slice(0, 6) || []);
        if (catRes.status === "fulfilled")
          setCategories(catRes.value.data?.slice(0, 8) || []);

        const hasAnyData =
          popularRes.status === "fulfilled" ||
          newestRes.status === "fulfilled" ||
          catRes.status === "fulfilled";

        if (!hasAnyData) {
          setHomeError(true);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setHomeError(true);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: <FaBook className="feature-icon-element" />,
      title: "Học theo lộ trình",
      desc: "Các khóa học được thiết kế bài bản, từ cơ bản đến nâng cao giúp bạn tiến bộ nhanh chóng.",
    },
    {
      icon: <FaTrophy className="feature-icon-element" />,
      title: "Chứng chỉ hoàn thành",
      desc: "Nhận chứng chỉ khi hoàn thành khóa học, tăng giá trị hồ sơ nghề nghiệp của bạn.",
    },
    {
      icon: <FaHeadset className="feature-icon-element" />,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ giảng viên tận tâm, sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn.",
    },
  ];

  return (
    <div className="home-page">
      {/* HERO BANNER */}
      <section className="hero-section" aria-labelledby="homepage-hero-title">
        <div className="hero-gradient-bg">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid-lines"></div>
        </div>
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-left">
              <div className="hero-badge">
                <FaRocket style={{ marginRight: "8px" }} />
                Nền tảng học trực tuyến #1 Việt Nam
              </div>
              <h1 className="hero-title" id="homepage-hero-title">
                Nâng cao kỹ năng,{" "}
                <span className="highlight">mở rộng tương lai</span>
              </h1>
            </div>

            <div className="hero-right">
              <div className="hero-illustration">
                <div className="hero-visual-center">
                  <div className="hero-visual-ring hero-visual-ring-1"></div>
                  <div className="hero-visual-ring hero-visual-ring-2"></div>
                  <div className="hero-visual-ring hero-visual-ring-3"></div>
                  <div className="hero-visual-core">
                    <FaRocket size={36} />
                  </div>
                </div>
                <div className="illustration-item item-1">
                  <div className="item-icon">🎓</div>
                  <div>
                    <div className="item-text">1,000+ Khóa học</div>
                    <div className="item-sub">Cập nhật liên tục</div>
                  </div>
                </div>
                <div className="illustration-item item-2">
                  <div className="item-icon">⭐</div>
                  <div>
                    <div className="item-text">Đánh giá 4.9/5</div>
                    <div className="item-sub">Từ 10K+ học viên</div>
                  </div>
                </div>
                <div className="illustration-item item-3">
                  <div className="item-icon">🏆</div>
                  <div>
                    <div className="item-text">Chứng chỉ uy tín</div>
                    <div className="item-sub">Được công nhận rộng rãi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY - Stats */}
      {/* <section className="trusted-section">
        <div className="container">
          <div className="trusted-stats stagger-children">
            <div>
              <div className="trusted-stat-number">10K+</div>
              <div className="trusted-stat-label">Học viên đang học</div>
            </div>
            <div>
              <div className="trusted-stat-number">1,000+</div>
              <div className="trusted-stat-label">Khóa học chất lượng</div>
            </div>
            <div>
              <div className="trusted-stat-number">500+</div>
              <div className="trusted-stat-label">Giảng viên uy tín</div>
            </div>
            <div>
              <div className="trusted-stat-number">98%</div>
              <div className="trusted-stat-label">Hài lòng</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* TOP COURSES SECTION */}
      <section
        className="courses-section"
        aria-labelledby="popular-courses-title"
      >
        <div className="container">
          <div className="section-title-block">
            <div>
              <h2 className="section-title" id="popular-courses-title">
                Khóa học phổ biến
              </h2>
              <p className="section-subtitle">
                Các khóa học được yêu thích nhất của chúng tôi
              </p>
            </div>
            <Link to={ROUTES.COURSES} className="view-all-link">
              Xem tất cả
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          <div className="courses-grid stagger-children">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : popularCourses.length > 0 ? (
              popularCourses
                .slice(0, 4)
                .map((course) => <CourseCard key={course.id} course={course} />)
            ) : (
              <div className="home-empty-state">
                <h3>Chưa có khóa học phổ biến</h3>
                <p>
                  Dữ liệu đang được cập nhật. Bạn có thể khám phá toàn bộ danh
                  sách khóa học ngay bây giờ.
                </p>
                <Link to={ROUTES.COURSES} className="btn btn-outline">
                  Xem danh sách khóa học
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section
        className="categories-section"
        aria-labelledby="categories-title"
      >
        <div className="container">
          <div className="section-title-block">
            <div>
              <h2 className="section-title" id="categories-title">
                Khám phá danh mục
              </h2>
              <p className="section-subtitle">
                Tìm khóa học phù hợp với mục tiêu của bạn
              </p>
            </div>
            <Link to={ROUTES.COURSES} className="view-all-link">
              Xem tất cả
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          <div className="categories-grid stagger-children">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton-box"
                  style={{ height: "80px" }}
                ></div>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat, idx) => {
                const categoryIcons = [
                  FaLaptop,
                  FaPalette,
                  FaMobileAlt,
                  FaChartBar,
                  FaBook,
                  FaGlobe,
                  FaFilm,
                  FaMusic,
                ];
                const IconComponent = categoryIcons[idx % 8];
                return (
                  <Link
                    key={cat.id}
                    to={`${ROUTES.COURSES}?category=${cat.id}`}
                    className="category-item"
                  >
                    <span className="category-icon">
                      <IconComponent size={24} />
                    </span>
                    <h3 className="category-name">{cat.name}</h3>
                  </Link>
                );
              })
            ) : (
              <div className="home-empty-state">
                <h3>Danh mục đang được cập nhật</h3>
                <p>
                  Chưa có danh mục hiển thị lúc này. Vui lòng quay lại sau hoặc
                  xem toàn bộ khóa học.
                </p>
                <Link to={ROUTES.COURSES} className="btn btn-outline">
                  Xem tất cả khóa học
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES / WHY US */}
      <section className="features-section">
        <div className="container">
          <div className="section-title-block section-title-centered">
            <div>
              <h2 className="section-title">Tại sao chọn LMS?</h2>
              <p className="section-subtitle">
                Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất
              </p>
            </div>
          </div>
          <div className="features-grid stagger-children">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWEST COURSES SECTION */}
      <section
        className="courses-section courses-section-muted"
        aria-labelledby="newest-courses-title"
      >
        <div className="container">
          <div className="section-title-block">
            <div>
              <h2 className="section-title" id="newest-courses-title">
                Khóa học mới nhất
              </h2>
              <p className="section-subtitle">
                Các khóa học vừa được phát hành
              </p>
            </div>
          </div>
          <div className="courses-grid stagger-children">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : newestCourses.length > 0 ? (
              newestCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="home-empty-state">
                <h3>Chưa có khóa học mới</h3>
                <p>
                  Nội dung mới đang được chuẩn bị. Theo dõi thêm các khóa học
                  nổi bật trong lúc chờ cập nhật.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {homeError && (
        <section className="home-error-state" role="status" aria-live="polite">
          <div className="container">
            <h3>Đang gặp sự cố khi tải dữ liệu</h3>
            <p>
              Một vài dữ liệu trang chủ chưa thể hiển thị đầy đủ. Bạn vẫn có thể
              tiếp tục duyệt khóa học ở trang danh sách.
            </p>
            <Link to={ROUTES.COURSES} className="btn btn-primary">
              Mở trang khóa học
            </Link>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-sparkles">
            <span className="sparkle s1">✦</span>
            <span className="sparkle s2">✦</span>
            <span className="sparkle s3">✧</span>
          </div>
          <h2 className="cta-title">
            Bắt đầu hành trình học tập của bạn ngay hôm nay
          </h2>
          <p className="cta-desc">
            Truy cập hơn 1,000 khóa học và phát triển kỹ năng không giới hạn
          </p>
          <Link to={ROUTES.REGISTER} className="cta-btn">
            Đăng ký miễn phí →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
