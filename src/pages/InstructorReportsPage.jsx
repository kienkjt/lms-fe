import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardService } from "../services/dashboardService";
import { formatPrice } from "../utils/helpers";
import Loading from "../components/common/Loading";
import "../components/student/Dashboard.css";
import "../components/instructor/Dashboard.css";
import "./InstructorReportsPage.css";

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const parseDateLabel = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const raw = String(value).trim();

  const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  const viDate = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
  if (viDate) {
    const day = Number(viDate[1]);
    const month = Number(viDate[2]) - 1;
    const year = viDate[3] ? Number(viDate[3]) : new Date().getFullYear();
    return new Date(year, month, day);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const keyByDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const buildLast30DaysSeries = (rawSeries, valueField, endDateText) => {
  const endDate = parseDateLabel(endDateText) || new Date();
  const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const map = new Map();
  (rawSeries || []).forEach((item) => {
    const date = parseDateLabel(item?.date || item?.label || item?.name);
    if (!date) return;
    map.set(keyByDate(date), Number(item?.[valueField] || item?.value || 0));
  });

  return Array.from({ length: 30 }, (_, idx) => {
    const d = new Date(normalizedEnd);
    d.setDate(normalizedEnd.getDate() - (29 - idx));
    const key = keyByDate(d);

    return {
      name: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      value: map.get(key) || 0,
    };
  });
};

const resolveCourseRevenue = (course) => {
  const value =
    course?.totalRevenue ??
    course?.revenue ??
    course?.total_revenue ??
    course?.courseRevenue ??
    course?.grossRevenue ??
    course?.netRevenue ??
    course?.amount ??
    0;

  return Number(value) || 0;
};

const InstructorReportsPage = ({ disableContainer }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getInstructorReport({ year, month });
        setReport(res.data || null);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [year, month]);

  const stats = useMemo(
    () => [
      { label: "Đơn bán", value: report?.soldItems || 0 },
      { label: "Ghi danh mới", value: report?.newEnrollments || 0 },
      { label: "Khóa học mới", value: report?.newCourses || 0 },
    ],
    [report],
  );

  const revenueSeries = useMemo(
    () => buildLast30DaysSeries(report?.dailyRevenue, "amount", report?.toDate),
    [report?.dailyRevenue, report?.toDate],
  );

  const enrollmentSeries = useMemo(
    () => buildLast30DaysSeries(report?.dailyEnrollments, "count", report?.toDate),
    [report?.dailyEnrollments, report?.toDate],
  );

  if (loading) return <Loading />;

  return (
    <div
      className={
        disableContainer
          ? "animate-fade-in instructor-reports-page"
          : "dashboard-page instructor-dashboard-page animate-fade-in instructor-reports-page"
      }
    >
      <div className="dashboard-section">
        <div className="section-header" style={{ marginBottom: 16 }}>
          {!disableContainer && <h1>Báo cáo giảng viên</h1>}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginLeft: disableContainer ? 0 : "auto",
            }}
          >
            <select
              className="form-input"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
            <select
              className="form-input"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ marginTop: 0, color: "#666" }}>
          Khoảng thời gian: {report?.fromDate || "-"} đến {report?.toDate || "-"}
        </p>

        <div className="stats-grid">
          {stats.map((item) => (
            <div key={item.label} className="stat-card">
              <div className="stat-label">{item.label}</div>
              <div className="stat-number">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Biểu đồ doanh thu theo 30 ngày gần nhất</h2>
        </div>
        <div className="report-chart-wrap">
          <ResponsiveContainer>
            <LineChart data={revenueSeries} margin={{ top: 10, right: 20, left: 8, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" interval={4} />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                  }).format(value)
                }
              />
              <Tooltip formatter={(value) => [formatPrice(value), "Doanh thu"]} labelStyle={{ color: "#333" }} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Biểu đồ ghi danh theo 30 ngày gần nhất</h2>
        </div>
        <div className="report-chart-wrap">
          <ResponsiveContainer>
            <BarChart data={enrollmentSeries} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" interval={4} />
              <YAxis />
              <Tooltip formatter={(value) => [value, "Lượt ghi danh"]} labelStyle={{ color: "#333" }} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Top khóa học theo doanh thu</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Khóa học</th>
              <th>Lượt bán</th>
              <th>Học viên</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {(report?.topSellingCourses || []).map((course) => (
              <tr key={course.courseId}>
                <td>{course.courseTitle}</td>
                <td>{course.totalSales || 0}</td>
                <td>{course.totalStudents || 0}</td>
                <td>{formatPrice(resolveCourseRevenue(course))}</td>
              </tr>
            ))}
            {(report?.topSellingCourses || []).length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                  Chưa có dữ liệu trong khoảng thời gian này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorReportsPage;
