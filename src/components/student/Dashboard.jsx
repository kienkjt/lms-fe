import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { enrollmentService } from "../../services/enrollmentService";
import { learningAnalyticsService } from "../../services/learningAnalyticsService";
import { ROUTES } from "../../utils/constants";
import Loading from "../common/Loading";
import "./Dashboard.css";

const normalizeEnrollment = (enrollment) => ({
  ...enrollment,
  id: enrollment.enrollmentId || enrollment.id,
  courseId: enrollment.courseId || enrollment.course?.id,
  courseTitle: enrollment.courseTitle || enrollment.course?.title,
  courseThumbnail:
    enrollment.courseThumbnail ||
    enrollment.course?.thumbnail ||
    enrollment.course?.image,
  instructorName:
    enrollment.instructorName || enrollment.course?.instructorName,
  progressPercent:
    enrollment.progressPercent ??
    enrollment.progress ??
    enrollment.course?.progressPercent ??
    0,
});

const getAccountCreatedDate = (user) => {
  const rawDate =
    user?.createdAt ||
    user?.registeredAt ||
    user?.joinDate ||
    user?.accountCreatedAt ||
    user?.createdDate;

  if (!rawDate) return null;

  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const addOneYear = (date) => {
  const nextYear = new Date(date);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return nextYear;
};

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [streak, setStreak] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("year"); // 30days, 3months, 6months, year
  const accountCreatedDate = getAccountCreatedDate(user);

  const getDateRangeParams = useCallback(() => {
    const toDate = new Date();
    const fromDate = new Date();
    
    switch (dateRange) {
      case "30days":
        fromDate.setDate(toDate.getDate() - 29);
        break;
      case "3months":
        fromDate.setMonth(toDate.getMonth() - 3);
        break;
      case "6months":
        fromDate.setMonth(toDate.getMonth() - 6);
        break;
      case "year":
        if (accountCreatedDate) {
          fromDate.setTime(accountCreatedDate.getTime());
          const oneYearLater = addOneYear(accountCreatedDate);
          if (oneYearLater < toDate) {
            toDate.setTime(oneYearLater.getTime());
          }
        } else {
          fromDate.setFullYear(toDate.getFullYear());
          fromDate.setMonth(0, 1);
        }
        break;
      default:
        fromDate.setDate(toDate.getDate() - 29);
    }
    
    return {
      fromDate: fromDate.toISOString().slice(0, 10),
      toDate: toDate.toISOString().slice(0, 10)
    };
  }, [accountCreatedDate, dateRange]);

  useEffect(() => {
    if (!user?.id) return;
    
    const { fromDate: from, toDate: to } = getDateRangeParams();

    Promise.all([
      enrollmentService.getStudentCoursesPaginated({ page: 1, size: 6 }),
      learningAnalyticsService.getMyStreak(),
      learningAnalyticsService.getMyHeatmap({ fromDate: from, toDate: to }),
    ])
      .then(([coursesRes, streakRes, heatmapRes]) => {
        const data = coursesRes.data?.content || coursesRes.data || [];
        setEnrollments(
          Array.isArray(data) ? data.map(normalizeEnrollment) : [],
        );
        setStreak(streakRes.data || null);
        setHeatmap(Array.isArray(heatmapRes.data) ? heatmapRes.data : []);
      })
      .catch(() => {
        setEnrollments([]);
        setStreak(null);
        setHeatmap([]);
      })
      .finally(() => setLoading(false));
  }, [user, dateRange, getDateRangeParams]);

  const getActivityLabel = (count) => {
    if (count === 0) return "Không học";
    if (count === 1) return "1 hoạt động";
    if (count <= 3) return `${count} hoạt động`;
    return "Rất tích cực";
  };

  const getActivityColor = (count) => {
    if (count >= 4) return "#216e39";
    if (count >= 3) return "#30a14e";
    if (count >= 2) return "#40c463";
    if (count >= 1) return "#9be9a8";
    return "#ebedf0";
  };

  const weeks = [];
  if (heatmap && heatmap.length > 0) {
    for (let i = 0; i < heatmap.length; i += 7) {
      weeks.push(heatmap.slice(i, i + 7));
    }
  }

  // Group heatmap by months for year view
  const monthlyHeatmap = () => {
    if (!heatmap || heatmap.length === 0) return [];
    
    const monthsMap = {};
    
    heatmap.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthsMap[monthKey]) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        monthsMap[monthKey] = {
          id: monthKey,
          monthName: `Tháng ${date.getMonth() + 1}`,
          year: date.getFullYear(),
          emptyDays: firstDay.getDay(), // 0 for Sunday
          data: [],
        };
      }
      monthsMap[monthKey].data.push(day);
    });

    return Object.values(monthsMap);
  };

  const stats = [
    { label: "Khóa học", value: enrollments.length, color: "indigo" },
    {
      label: "Đang theo học",
      value: enrollments.filter((e) => !e.completedAt && e.progressPercent > 0)
        .length,
      color: "blue",
    },
    {
      label: "Hoàn thành",
      value: enrollments.filter((e) => e.completedAt).length,
      color: "green",
    },
    {
      label: "Streak ngày",
      value: streak?.currentStreak || 0,
      color: "orange",
    },
  ];
  const activeDays = heatmap.filter((d) => d.activityCount > 0).length;
  const totalMinutes = Math.round(
    heatmap.reduce((sum, d) => sum + (d.estimatedMinutes || 0), 0),
  );

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="welcome-section">
        <div className="welcome-content-std">
          <h1>Chào mừng trở lại, {user?.firstName}!</h1>
          <p>Tiếp tục học mỗi ngày để giữ streak và tăng kỹ năng.</p>
          <div className="welcome-actions">
            <Link to={ROUTES.COURSES} className="btn-explore-courses">
              Khám phá khóa học
            </Link>
          </div>
        </div>
      </div>

      <div className="stats-overview">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card-std color-${s.color}`}>
            <div className="stat-body">
              <div className="stat-value-std">{s.value}</div>
              <div className="stat-label-std">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="streak-banner">
        <div className="streak-title">
          🔥 Bạn đã học liên tiếp <strong>{streak?.currentStreak || 0}</strong>{" "}
          ngày
        </div>
        {streak?.warningMessage && (
          <div className="streak-warning">{streak.warningMessage}</div>
        )}
      </div>

      <div className="learning-heatmap-container">
        <div className="section-header-std">
          <div>
            <h2>📅 Lịch Hoạt Động Học Tập</h2>
          </div>
        </div>

        <div className="heatmap-filters">
          <button
            className={`filter-btn ${dateRange === "30days" ? "active" : ""}`}
            onClick={() => setDateRange("30days")}
          >
            30 ngày
          </button>
          <button
            className={`filter-btn ${dateRange === "3months" ? "active" : ""}`}
            onClick={() => setDateRange("3months")}
          >
            3 tháng
          </button>
          <button
            className={`filter-btn ${dateRange === "6months" ? "active" : ""}`}
            onClick={() => setDateRange("6months")}
          >
            6 tháng
          </button>
          <button
            className={`filter-btn ${dateRange === "year" ? "active" : ""}`}
            onClick={() => setDateRange("year")}
          >
            1 năm
          </button>
        </div>

        {dateRange === "year" ? (
          <div className="heatmap-yearly">
            {monthlyHeatmap().map((monthData) => (
              <div key={monthData.id} className="monthly-heatmap">
                <div className="month-label">
                  {monthData.monthName} {monthData.year}
                </div>
                <div className="calendar-board">
                  <div className="calendar-grid">
                    {Array.from({ length: monthData.emptyDays }).map((_, i) => (
                      <div key={`empty-${i}`} className="heatmap-day-compact empty" />
                    ))}
                    {monthData.data.map((day) => (
                      <div
                        key={day.date}
                        className="heatmap-day-compact"
                        style={{
                          backgroundColor: getActivityColor(day.activityCount),
                        }}
                        title={`${day.date}: ${getActivityLabel(day.activityCount)} (${day.estimatedMinutes} phút)`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="heatmap-wrapper">
            <div className="heatmap-days-labels">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                <div key={day} className="day-label">
                  {day}
                </div>
              ))}
            </div>

            <div className="heatmap-content">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="heatmap-week">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className="heatmap-day"
                      style={{
                        backgroundColor: getActivityColor(day.activityCount),
                      }}
                      title={`${day.date}: ${getActivityLabel(day.activityCount)} (${day.estimatedMinutes} phút)`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="heatmap-legend">
          <span className="legend-label">Ít</span>
          <div className="legend-items">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ebedf0" }}
              title="Không học"
            />
            <div
              className="legend-color"
              style={{ backgroundColor: "#9be9a8" }}
              title="1 hoạt động"
            />
            <div
              className="legend-color"
              style={{ backgroundColor: "#40c463" }}
              title="2-3 hoạt động"
            />
            <div
              className="legend-color"
              style={{ backgroundColor: "#30a14e" }}
              title="4+ hoạt động"
            />
            <div
              className="legend-color"
              style={{ backgroundColor: "#216e39" }}
              title="Rất tích cực"
            />
          </div>
          <span className="legend-label">Nhiều</span>
        </div>

        <div className="heatmap-stats">
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <div>
              <div className="stat-number">
                {activeDays}
              </div>
              <div className="stat-text">Ngày học tập</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <div>
              <div className="stat-number">
                {totalMinutes}
              </div>
              <div className="stat-text">Phút học</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <div>
              <div className="stat-number">{streak?.currentStreak || 0}</div>
              <div className="stat-text">Streak hiện tại</div>
            </div>
          </div>
        </div>
      </div>

      <div className="courses-section">
        <div className="section-header-std">
          <h2>🎓 Khóa Học Của Tôi</h2>
          <Link to={ROUTES.STUDENT_COURSES} className="link-see-all">
            Xem tất cả →
          </Link>
        </div>
        <div className="course-grid-std">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="course-card-std">
              <div className="course-thumbnail-std">
                {enrollment.courseThumbnail ? (
                  <img
                    src={enrollment.courseThumbnail}
                    alt={enrollment.courseTitle || "Khóa học"}
                  />
                ) : null}
              </div>
              <div className="course-info-std">
                <h4 className="course-title-std">{enrollment.courseTitle}</h4>
                <div className="course-instructor">
                  {enrollment.instructorName}
                </div>
                <div className="course-progress-wrapper">
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${enrollment.progressPercent || 0}%` }}
                    />
                  </div>
                </div>
                <div className="course-action">
                  <Link
                    to={`/learn/${enrollment.courseId}`}
                    className="btn-continue-learning"
                  >
                    Tiếp tục học
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

