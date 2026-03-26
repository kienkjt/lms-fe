import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { categoryService } from '../services/categoryService';
import CourseCard from '../components/courses/CourseCard';
import { SkeletonCard } from '../components/common/Loading';
import { COURSE_LEVELS, PAGINATION } from '../utils/constants';
import './CoursesPage.css';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    priceMin: '',
    priceMax: '',
    sort: searchParams.get('sort') || 'popular',
  });

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters, page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.search({
        categoryId: filters.category || undefined,
        level: filters.level || undefined,
        priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
        sort: filters.sort,
        page,
        size: PAGINATION.DEFAULT_SIZE,
      });
      setCourses(res.data?.content || res.data || []);
      setTotal(res.data?.totalElements || res.data?.length || 0);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ category: '', level: '', priceMin: '', priceMax: '', sort: 'popular' });
    setPage(0);
    setSearchParams({});
  };

  const levelLabels = { BEGINNER: 'Cơ bản', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao' };
  const sortOptions = [
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
  ];

  const totalPages = Math.ceil(total / PAGINATION.DEFAULT_SIZE);

  return (
    <div className="courses-page">
      {/* Page Header */}
      <div className="courses-header">
        <div className="container">
          <h1>Tất cả khóa học</h1>
          <p>Khám phá {total > 0 ? total : 'hàng nghìn'} khóa học chất lượng cao</p>
        </div>
      </div>

      <div className="container">
        <div className="courses-layout">
          {/* Sidebar Filters */}
          <aside className="courses-filters">
            <div className="filter-header">
              <h3>Bộ lọc</h3>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Xóa bộ lọc</button>
            </div>

            {/* Category */}
            <div className="filter-section">
              <h4>Danh mục</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="category" value="" checked={!filters.category}
                    onChange={() => handleFilterChange('category', '')} />
                  Tất cả
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="filter-option">
                    <input type="radio" name="category" value={cat.id}
                      checked={filters.category === cat.id}
                      onChange={() => handleFilterChange('category', cat.id)} />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="filter-section">
              <h4>Cấp độ</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="level" value="" checked={!filters.level}
                    onChange={() => handleFilterChange('level', '')} />
                  Tất cả
                </label>
                {Object.entries(levelLabels).map(([val, lbl]) => (
                  <label key={val} className="filter-option">
                    <input type="radio" name="level" value={val}
                      checked={filters.level === val}
                      onChange={() => handleFilterChange('level', val)} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-section">
              <h4>Giá (VND)</h4>
              <div className="price-range">
                <input type="number" className="form-input" placeholder="Từ"
                  value={filters.priceMin}
                  onChange={e => handleFilterChange('priceMin', e.target.value)} />
                <span>-</span>
                <input type="number" className="form-input" placeholder="Đến"
                  value={filters.priceMax}
                  onChange={e => handleFilterChange('priceMax', e.target.value)} />
              </div>
            </div>
          </aside>

          {/* Course List */}
          <div className="courses-main">
            {/* Sort Bar */}
            <div className="courses-sort-bar">
              <span className="results-count">
                {loading ? 'Đang tải...' : `${total} khóa học`}
              </span>
              <div className="sort-controls">
                <span>Sắp xếp:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '7px 36px 7px 12px' }}
                  value={filters.sort}
                  onChange={e => handleFilterChange('sort', e.target.value)}
                  id="course-sort"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="course-grid">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : courses.length > 0
                ? courses.map(course => <CourseCard key={course.id} course={course} />)
                : (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state-icon">🔍</div>
                    <h3>Không tìm thấy khóa học</h3>
                    <p>Thử thay đổi bộ lọc để tìm kiếm kết quả khác</p>
                    <button className="btn btn-outline" onClick={clearFilters}>Xóa bộ lọc</button>
                  </div>
                )
              }
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>←</button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const pageNum = i;
                  return (
                    <button
                      key={i}
                      className={`page-btn ${page === pageNum ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>→</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
