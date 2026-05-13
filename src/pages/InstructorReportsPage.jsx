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

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

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
      { label: "Doanh thu", value: formatPrice(report?.revenue || 0) },
      { label: "Đơn bán", value: report?.soldItems || 0 },
      { label: "Ghi danh mới", value: report?.newEnrollments || 0 },
      { label: "Khóa học mới", value: report?.newCourses || 0 },
    ],
    [report],
  );
  const revenueSeries = Array.isArray(report?.dailyRevenue)
    ? report.dailyRevenue.map((item) => ({
        name: item.label,
        value: Number(item.amount || 0),
      }))
    : [];
  const enrollmentSeries = Array.isArray(report?.dailyEnrollments)
    ? report.dailyEnrollments.map((item) => ({
        name: item.label,
        value: Number(item.count || 0),
      }))
    : [];

  if (loading) return <Loading />;

  return (
    <div
      className={
        disableContainer
          ? "animate-fade-in"
          : "dashboard-page instructor-dashboard-page animate-fade-in"
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
          Khoảng thời gian: {report?.fromDate || "-"} đến{" "}
          {report?.toDate || "-"}
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
          <h2>Biểu đồ doanh thu theo ngày</h2>
        </div>
        {revenueSeries.length === 0 ? (
          <div className="empty-state">
            Chưa có dữ liệu doanh thu trong kỳ đã chọn.
          </div>
        ) : (
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <LineChart
                data={revenueSeries}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      notation: "compact",
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value) => [formatPrice(value), "Doanh thu"]}
                  labelStyle={{ color: "#333" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Biểu đồ ghi danh theo ngày</h2>
        </div>
        {enrollmentSeries.length === 0 ? (
          <div className="empty-state">
            Chưa có dữ liệu ghi danh trong kỳ đã chọn.
          </div>
        ) : (
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart
                data={enrollmentSeries}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, "Lượt ghi danh"]}
                  labelStyle={{ color: "#333" }}
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                />
                <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
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
                <td>{formatPrice(course.totalRevenue || 0)}</td>
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
