import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { dashboardService } from "../../services/dashboardService";
import { withdrawalService } from "../../services/withdrawalService";
import { ROUTES } from "../../utils/constants";
import { formatPrice } from "../../utils/helpers";
import {
  FaBook,
  FaCheck,
  FaUsers,
  FaStar,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import Loading from "../../components/common/Loading";
import "./Dashboard.css";

const normalizeSeries = (series = [], metric = "amount") =>
  (Array.isArray(series) ? series : [])
    .map((item, index) => ({
      label: item?.label || `N${index + 1}`,
      value: Number(
        metric === "count" ? (item?.count ?? 0) : (item?.amount ?? 0),
      ),
    }))
    .filter((item) => Number.isFinite(item.value));

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        dashboardService.getInstructorDashboard().catch(() => ({ data: null })),
        withdrawalService.getWallet().catch(() => ({ data: null })),
      ])
        .then(([dashRes, walletRes]) => {
          setDashboardStats(dashRes.data || null);
          setWallet(walletRes.data || null);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const stats = [
    {
      label: "Tổng khóa học",
      value: dashboardStats?.totalCourses ?? 0,
      icon: <FaBook size={24} />,
      color: "var(--primary)",
    },
    {
      label: "Đang hoạt động",
      value: dashboardStats?.publishedCourses ?? 0,
      icon: <FaCheck size={24} />,
      color: "var(--success)",
    },
    {
      label: "Tổng học sinh",
      value: dashboardStats?.totalStudents ?? 0,
      icon: <FaUsers size={24} />,
      color: "var(--secondary)",
    },
    {
      label: "Doanh thu",
      value: formatPrice(wallet?.totalEarned ?? 0),
      icon: <FaStar size={24} />,
      color: "var(--warning)",
    },
  ];

  const revenueSeries = normalizeSeries(dashboardStats?.dailyRevenue, "amount");
  const enrollmentSeries = normalizeSeries(
    dashboardStats?.dailyEnrollments,
    "count",
  );
  const revenueMax = Math.max(...revenueSeries.map((item) => item.value), 0);
  const enrollmentMax = Math.max(
    ...enrollmentSeries.map((item) => item.value),
    0,
  );
  const statusDistribution = Array.isArray(
    dashboardStats?.courseStatusDistribution,
  )
    ? dashboardStats.courseStatusDistribution
    : [];

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page instructor-dashboard-page animate-fade-in">
      <div className="welcome-banner">
        <div>
          <h1>
            Dashboard Giảng viên{" "}
            <FaStar size={28} style={{ display: "inline" }} />
          </h1>
          <p>Quản lý khóa học và theo dõi tiến độ học sinh của bạn.</p>
        </div>
        <Link
          to={ROUTES.INSTRUCTOR_CREATE_COURSE}
          className="btn btn-primary"
          style={{ background: "white", color: "var(--primary)" }}
        >
          <FaPlus style={{ marginRight: "6px" }} /> Tạo khóa học mới
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ "--stat-color": s.color }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Doanh thu 30 ngày</h2>
        </div>
        {revenueSeries.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu doanh thu.</div>
        ) : (
          <div className="instructor-chart">
            {revenueSeries.map((item) => {
              const percent =
                revenueMax > 0
                  ? Math.max(4, (item.value / revenueMax) * 100)
                  : 0;
              return (
                <div key={item.label} className="chart-row">
                  <div className="chart-label">{item.label}</div>
                  <div className="chart-track">
                    <div
                      className="chart-bar"
                      style={{ width: `${percent}%` }}
                      title={`${item.value}`}
                    />
                  </div>
                  <div className="chart-value">{formatPrice(item.value)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Đăng ký mới 30 ngày</h2>
        </div>
        {enrollmentSeries.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu đăng ký mới.</div>
        ) : (
          <div className="instructor-chart">
            {enrollmentSeries.map((item) => {
              const percent =
                enrollmentMax > 0
                  ? Math.max(4, (item.value / enrollmentMax) * 100)
                  : 0;
              return (
                <div key={item.label} className="chart-row">
                  <div className="chart-label">{item.label}</div>
                  <div className="chart-track">
                    <div
                      className="chart-bar chart-bar-alt"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="chart-value">{item.value}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Trạng thái khóa học</h2>
        </div>
        <div className="status-chips">
          {statusDistribution.map((item) => (
            <div key={item.status} className="status-chip">
              <span>{item.description || item.status}</span>
              <strong>{item.count ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>

      {showDetailModal && selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseDetailModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Chi tiet yeu cau rut tien</h2>
              <button
                onClick={handleCloseDetailModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
