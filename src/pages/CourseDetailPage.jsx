import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { cartService } from '../services/cartService';
import { addToCart } from '../store/cartSlice';
import { formatPrice, formatDuration, formatDate, getStarArray } from '../utils/helpers';
import { ROUTES, ROLES } from '../utils/constants';
import Loading from '../components/common/Loading';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inCart = items.some(i => i.courseId === course?.id);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseService.getBySlug(slug);
        const c = res.data;
        setCourse(c);

        const [chaptersRes, reviewsRes] = await Promise.allSettled([
          import('../services/api').then(m => m.default.get(`/api/v1/chapters/course/${c.id}`)),
          import('../services/api').then(m => m.default.get(`/api/v1/reviews/course/${c.id}`)),
        ]);
        if (chaptersRes.status === 'fulfilled') {
          setChapters(chaptersRes.value.data || []);
          if (chaptersRes.value.data?.length > 0) setExpandedChapter(chaptersRes.value.data[0].id);
        }
        if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data || []);

        if (isAuthenticated && user?.role === ROLES.STUDENT) {
          try {
            const enrollRes = await enrollmentService.getEnrollment(c.id);
            setEnrollment(enrollRes.data);
          } catch {}
        }
      } catch {
        toast.error('Không tìm thấy khóa học');
        navigate(ROUTES.COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    if (inCart) { navigate(ROUTES.CART); return; }
    try {
      await cartService.addItem(course.id);
      dispatch(addToCart({ courseId: course.id, course }));
      toast.success('Đã thêm vào giỏ hàng!');
    } catch { toast.error('Không thể thêm vào giỏ hàng'); }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    setEnrollLoading(true);
    try {
      await enrollmentService.enroll(course.id);
      setEnrollment({ enrolled: true, progressPercent: 0 });
      toast.success('Đăng ký khóa học thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng ký khóa học');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) return <Loading fullPage />;
  if (!course) return null;

  const stars = getStarArray(course.avgRating || 0);
  const isFree = !course.price || course.price === 0;
  const price = course.discountPrice || course.price;

  return (
    <div className="course-detail-page">
      {/* Hero */}
      <div className="course-detail-hero">
        <div className="container">
          <div className="course-detail-header">
            <div className="course-detail-info">
              <div className="flex gap-2 mb-4">
                {course.level && (
                  <span className={`badge ${course.level === 'BEGINNER' ? 'badge-success' : course.level === 'INTERMEDIATE' ? 'badge-warning' : 'badge-error'}`}>
                    {course.level === 'BEGINNER' ? 'Cơ bản' : course.level === 'INTERMEDIATE' ? 'Trung cấp' : 'Nâng cao'}
                  </span>
                )}
              </div>
              <h1 className="course-detail-title">{course.title}</h1>
              <p className="course-detail-short-desc">{course.shortDescription}</p>

              <div className="course-rating" style={{ marginBottom: '16px' }}>
                <span className="rating-value">{(course.avgRating || 0).toFixed(1)}</span>
                <div className="stars">
                  {stars.map((s, i) => <span key={i} className={`star star-${s}`}>★</span>)}
                </div>
                <span className="rating-count">({course.totalReviews || 0} đánh giá)</span>
                <span>•</span>
                <span>👥 {course.totalStudents || 0} học sinh</span>
              </div>

              {course.instructorName && (
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
                  👨‍🏫 Giảng viên: <strong style={{ color: 'white' }}>{course.instructorName}</strong>
                </p>
              )}
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                📅 Cập nhật: {formatDate(course.updatedAt)} • 🌐 {course.language || 'Tiếng Việt'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="course-detail-layout">
          {/* Main */}
          <div className="course-detail-main">
            {/* Tabs */}
            <div className="tabs">
              {['overview', 'curriculum', 'reviews'].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}>
                  {{ overview: 'Tổng quan', curriculum: 'Nội dung', reviews: 'Đánh giá' }[tab]}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                {/* What you'll learn */}
                {course.whatYouWillLearn && (
                  <div className="card card-body mb-6">
                    <h3 style={{ marginBottom: '16px' }}>🎯 Bạn sẽ học được</h3>
                    <div className="learn-grid">
                      {(Array.isArray(course.whatYouWillLearn)
                        ? course.whatYouWillLearn
                        : course.whatYouWillLearn.split('\n').filter(Boolean)
                      ).map((item, i) => (
                        <div key={i} className="learn-item">✅ {item}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                {course.fullDescription && (
                  <div className="card card-body mb-6">
                    <h3 style={{ marginBottom: '16px' }}>📋 Mô tả khóa học</h3>
                    <p style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>{course.fullDescription}</p>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements && (
                  <div className="card card-body">
                    <h3 style={{ marginBottom: '16px' }}>📌 Yêu cầu</h3>
                    {(Array.isArray(course.requirements)
                      ? course.requirements
                      : course.requirements.split('\n').filter(Boolean)
                    ).map((req, i) => (
                      <p key={i} style={{ marginBottom: '8px' }}>• {req}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="animate-fade-in">
                <div className="curriculum-summary">
                  <span>📝 {course.totalLessons || 0} bài học</span>
                  <span>⏱️ {formatDuration(course.totalDuration)}</span>
                </div>
                {chapters.map(chapter => (
                  <div key={chapter.id} className="chapter-item">
                    <button
                      className="chapter-header"
                      onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                    >
                      <span className="chapter-toggle">{expandedChapter === chapter.id ? '▼' : '▶'}</span>
                      <span className="chapter-title">{chapter.title}</span>
                    </button>
                    {expandedChapter === chapter.id && chapter.lessons && (
                      <div className="chapter-lessons">
                        {chapter.lessons.map(lesson => (
                          <div key={lesson.id} className="lesson-item">
                            <span>▶️</span>
                            <span className="lesson-name">{lesson.title}</span>
                            {lesson.isFreePreview && <span className="badge badge-success">Xem thử</span>}
                            <span className="lesson-duration">{formatDuration(lesson.duration)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                <div className="reviews-summary">
                  <div className="rating-big">
                    <span className="rating-num">{(course.avgRating || 0).toFixed(1)}</span>
                    <div className="stars" style={{ fontSize: '24px' }}>{stars.map((s, i) => <span key={i} className={`star star-${s}`}>★</span>)}</div>
                    <span className="rating-count">({course.totalReviews || 0})</span>
                  </div>
                </div>
                {reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="avatar avatar-sm">{review.studentName?.[0] || 'U'}</div>
                      <div>
                        <div className="font-semibold">{review.studentName}</div>
                        <div className="stars" style={{ fontSize: '14px' }}>
                          {getStarArray(review.rating).map((s, i) => <span key={i} className={`star star-${s}`}>★</span>)}
                        </div>
                      </div>
                      <span className="text-muted text-sm">{formatDate(review.createdAt)}</span>
                    </div>
                    <p style={{ marginTop: '8px', paddingLeft: '44px' }}>{review.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">⭐</div>
                    <h3>Chưa có đánh giá</h3>
                    <p>Hãy là người đầu tiên đánh giá khóa học này</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Purchase Card */}
          <div className="course-purchase-card">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="purchase-thumbnail" />
            )}
            <div className="purchase-body">
              <div className="purchase-price">
                {isFree ? (
                  <span className="price-free">Miễn phí</span>
                ) : (
                  <>
                    <span className="price-current">{formatPrice(price)}</span>
                    {course.discountPrice && course.price && course.discountPrice < course.price && (
                      <span className="price-original">{formatPrice(course.price)}</span>
                    )}
                  </>
                )}
              </div>

              {enrollment ? (
                <Link to={`/learn/${course.id}`} className="btn btn-success btn-full btn-lg">
                  ▶️ Tiếp tục học
                </Link>
              ) : isFree ? (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  id="enroll-btn"
                >
                  {enrollLoading ? <><span className="spinner spinner-sm"></span> Đang đăng ký...</> : '🎓 Đăng ký học miễn phí'}
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handleAddToCart}
                    id="add-to-cart-btn"
                  >
                    {inCart ? '→ Đến giỏ hàng' : '🛒 Thêm vào giỏ hàng'}
                  </button>
                  <button className="btn btn-outline btn-full" onClick={handleEnroll} disabled={enrollLoading}>
                    Mua ngay
                  </button>
                </>
              )}

              <div className="purchase-includes">
                <h4>Bao gồm:</h4>
                <div className="include-item"><span>📹</span> Video HD chất lượng cao</div>
                <div className="include-item"><span>♾️</span> Truy cập trọn đời</div>
                <div className="include-item"><span>📱</span> Học trên mobile & tablet</div>
                <div className="include-item"><span>🏆</span> Chứng chỉ hoàn thành</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
