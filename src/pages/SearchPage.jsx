import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseService } from '../services/courseService';
import CourseCard from '../components/courses/CourseCard';
import { SkeletonCard } from '../components/common/Loading';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    courseService.search({ keyword: query, size: 20 })
      .then(res => setCourses(res.data?.content || res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="container" style={{ padding: '40px var(--space-6)' }}>
      <h1 style={{ marginBottom: '8px' }}>Kết quả tìm kiếm</h1>
      {query && <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
        {loading ? 'Đang tìm kiếm...' : `${courses.length} kết quả cho "${query}"`}
      </p>}
      {!query && (
        <p style={{ color: 'var(--text-secondary)' }}>Vui lòng nhập từ khóa để tìm kiếm</p>
      )}
      <div className="course-grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : courses.map(course => <CourseCard key={course.id} course={course} />)
        }
      </div>
      {!loading && courses.length === 0 && query && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Không tìm thấy kết quả</h3>
          <p>Thử từ khóa khác hoặc xem tất cả khóa học</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
