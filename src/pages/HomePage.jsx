import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import { categoryService } from "../services/categoryService";
import CourseCard from "../components/courses/CourseCard";
import { SkeletonCard } from "../components/common/Loading";
import { ROUTES } from "../utils/constants";
import "./HomePage.css";

const HomePage = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [newestCourses, setNewestCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim())
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="home-page">
      {/* HERO BANNER */}
      <section className="hero-section">
        <div className="hero-gradient-bg"></div>
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-left">
              <h1 className="hero-title">
                Học bất kỳ kỹ năng nào, từ bất kỳ nơi đâu
              </h1>
              <p className="hero-subtitle">
                Tìm và hoàn thành các khóa học trực tuyến từ hàng ngàn giảng
                viên tài năng.
              </p>

              <form className="hero-search-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Bạn muốn học gì?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>

              <div className="hero-tags">
                {[
                  "Web Development",
                  "Python",
                  "UI Design",
                  "Data Science",
                  "Business",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="hero-tag-btn"
                    onClick={() => navigate(`${ROUTES.SEARCH}?q=${tag}`)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-illustration">
                <div className="illustration-item item-1">
                  <div className="item-icon">📚</div>
                  <div className="item-text">1K+ Khóa học</div>
                </div>
                <div className="illustration-item item-2">
                  <div className="item-icon">👨‍🏫</div>
                  <div className="item-text">500+ Giảng viên</div>
                </div>
                <div className="illustration-item item-3">
                  <div className="item-icon">⭐</div>
                  <div className="item-text">4.8/5 Đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories-section">
        <div className="container">
          <div className="section-title-block">
            <h2 className="section-title">Danh mục khóa học</h2>
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
          <div className="categories-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-box"
                    style={{ height: "80px" }}
                  ></div>
                ))
              : categories.length > 0
                ? categories.map((cat, idx) => (
                    <Link
                      key={cat.id}
                      to={`${ROUTES.COURSES}?category=${cat.id}`}
                      className="category-item"
                    >
                      <span className="category-icon">
                        {
                          ["💻", "🎨", "📱", "📊", "📚", "🌍", "🎬", "🎵"][
                            idx % 8
                          ]
                        }
                      </span>
                      <h3 className="category-name">{cat.name}</h3>
                    </Link>
                  ))
                : null}
          </div>
        </div>
      </section>

      {/* TOP COURSES SECTION */}
      <section className="courses-section">
        <div className="container">
          <div className="section-title-block">
            <div>
              <h2 className="section-title">Khóa học phổ biến</h2>
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
          <div className="courses-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : popularCourses.length > 0
                ? popularCourses
                    .slice(0, 4)
                    .map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))
                : null}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            Bắt đầu hành trình học tập của bạn ngay hôm nay
          </h2>
          <p className="cta-desc">
            Truy cập hơn 1000 khóa học và phát triển kỹ năng của bạn
          </p>
          <Link to={ROUTES.REGISTER} className="cta-btn">
            Đăng ký miễn phí →
          </Link>
        </div>
      </section>

      {/* NEWEST COURSES SECTION */}
      {newestCourses.length > 0 && (
        <section className="courses-section">
          <div className="container">
            <div className="section-title-block">
              <div>
                <h2 className="section-title">Khóa học mới nhất</h2>
                <p className="section-subtitle">
                  Các khóa học vừa được phát hành
                </p>
              </div>
            </div>
            <div className="courses-grid">
              {newestCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
