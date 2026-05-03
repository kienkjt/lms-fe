import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCertificate,
  FaDownload,
  FaListAlt,
} from "react-icons/fa";
import { certificateService } from "../services/certificateService";
import { ROUTES } from "../utils/constants";
import { formatDate } from "../utils/helpers";
import "./CertificatesPage.css";

const normalizeCertificate = (certificate) => {
  const course = certificate.course || {};

  return {
    id:
      certificate.id ||
      certificate.certificateId ||
      certificate.uuid ||
      certificate.code,
    code:
      certificate.code ||
      certificate.certificateCode ||
      certificate.serialNumber ||
      certificate.id ||
      certificate.certificateId,
    courseId: certificate.courseId || course.id,
    courseSlug: certificate.courseSlug || course.slug,
    courseTitle:
      certificate.courseTitle ||
      certificate.title ||
      course.title ||
      "Khoa hoc",
    instructorName:
      certificate.instructorName ||
      course.instructorName ||
      course.instructor?.fullName ||
      course.instructor?.name ||
      "",
    issuedAt:
      certificate.issuedAt ||
      certificate.issueDate ||
      certificate.createdAt ||
      certificate.completedAt,
  };
};

const normalizeCertificatePayload = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : payload?.content || payload?.items || payload?.certificates || [];

  return Array.isArray(list) ? list.map(normalizeCertificate) : [];
};

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await certificateService.getMyCertificates();
        setCertificates(normalizeCertificatePayload(response.data));
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        toast.error(
          error.response?.data?.message || "Khong the tai danh sach chung chi",
        );
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const stats = useMemo(
    () => ({
      total: certificates.length,
      latest: certificates[0]?.issuedAt,
    }),
    [certificates],
  );

  const handleDownload = async (certificate) => {
    if (!certificate.id) {
      toast.error("Chung chi khong co ma de tai xuong");
      return;
    }

    try {
      setDownloadingId(certificate.id);
      await certificateService.downloadCertificate(certificate.id);
      toast.success("Da tai chung chi");
    } catch (error) {
      console.error("Download certificate failed:", error);
      toast.error(error.response?.data?.message || "Khong the tai chung chi");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <div className="certificates-page animate-fade-in">
      <div className="certificates-header">
        <div>
          <h1>
            <FaCertificate /> Chung chi cua toi
          </h1>
          <p>Theo doi va tai xuong chung chi da nhan sau khi hoan thanh khoa hoc.</p>
        </div>
        <Link to={ROUTES.STUDENT_COURSES} className="btn btn-outline btn-sm">
          <FaBookOpen /> Khoa hoc cua toi
        </Link>
      </div>

      <div className="certificates-stats">
        <div className="certificates-stat-card">
          <span>Tong chung chi</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="certificates-stat-card latest">
          <span>Moi nhat</span>
          <strong>{stats.latest ? formatDate(stats.latest) : "-"}</strong>
        </div>
      </div>

      {loading ? (
        <div className="certificates-state">Dang tai danh sach chung chi...</div>
      ) : certificates.length === 0 ? (
        <div className="certificates-empty">
          <FaListAlt size={44} />
          <h3>Ban chua co chung chi nao</h3>
          <p>Chung chi se hien thi khi ban hoan thanh 100% khoa hoc co cap chung chi.</p>
          <Link to={ROUTES.STUDENT_COURSES} className="btn btn-primary btn-sm">
            Di den khoa hoc cua toi
          </Link>
        </div>
      ) : (
        <div className="certificates-list">
          {certificates.map((certificate) => {
            const coursePath = certificate.courseSlug || certificate.courseId;

            return (
              <article
                className="certificate-card"
                key={certificate.id || certificate.code || certificate.courseId}
              >
                <div className="certificate-badge">
                  <FaCertificate />
                </div>

                <div className="certificate-content">
                  <h3>{certificate.courseTitle}</h3>
                  {certificate.instructorName && (
                    <p className="certificate-instructor">
                      Giang vien: {certificate.instructorName}
                    </p>
                  )}
                  <div className="certificate-meta">
                    <span>
                      <FaCalendarAlt /> Ngay cap:{" "}
                      {certificate.issuedAt ? formatDate(certificate.issuedAt) : "-"}
                    </span>
                    {certificate.code && <span>Ma: {certificate.code}</span>}
                  </div>
                </div>

                <div className="certificate-actions">
                  {coursePath && (
                    <Link
                      to={`/courses/${coursePath}`}
                      className="btn btn-outline btn-sm"
                    >
                      Xem khoa hoc
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownload(certificate)}
                    disabled={downloadingId === certificate.id}
                  >
                    <FaDownload />
                    {downloadingId === certificate.id ? "Dang tai..." : "Tai PDF"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
