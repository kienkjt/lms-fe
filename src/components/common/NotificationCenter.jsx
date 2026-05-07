import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiBell, FiCheck, FiRefreshCw } from "react-icons/fi";
import { notificationService } from "../../services/notificationService";
import "./NotificationCenter.css";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
};

const normalizeNotifications = (payload) => {
  const list = toList(payload);

  return list.map((item, index) => ({
    id: item.id || item.notificationId || `temp-${index}`,
    title: item.title || item.subject || "Thông báo",
    message: item.message || item.content || item.description || "",
    createdAt:
      item.createdAt || item.timestamp || item.sentAt || item.updatedAt || null,
    isRead: Boolean(item.read ?? item.isRead ?? item.readStatus === "READ"),
  }));
};

const getPageInfo = (payload, fallbackPage = 0) => {
  if (Array.isArray(payload)) {
    return { page: fallbackPage, totalPages: 1, hasNext: false };
  }

  const rawPage =
    payload?.number ?? payload?.pageNumber ?? payload?.page ?? fallbackPage;
  const page = Number(rawPage) || 0;
  const totalPages = Math.max(1, Number(payload?.totalPages) || 1);
  const hasNext = Boolean(
    payload?.hasNext ??
      (payload?.last !== undefined
        ? payload.last === false
        : page + 1 < totalPages),
  );

  return {
    page,
    totalPages,
    hasNext,
  };
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return "Vừa xong";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 1,
    hasNext: false,
  });

  const containerRef = useRef(null);

  const unreadCountFromList = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async ({ page = 0, reset = true } = {}) => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getAll({ page, size: 10 });
      const payload =
        response.data?.data?.data || response.data?.data || response.data;
      const nextNotifications = normalizeNotifications(payload);
      setNotifications((prev) => {
        if (reset) return nextNotifications;

        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNext = nextNotifications.filter(
          (item) => !existingIds.has(item.id),
        );
        return [...prev, ...uniqueNext];
      });
      setPageInfo(getPageInfo(payload, page));
      setHasLoaded(true);
    } catch (fetchError) {
      console.error("Failed to fetch notifications:", fetchError);
      setError("Không thể tải thông báo");
      if (reset) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      const payload = response.data?.data || response.data;
      const count = Number(payload?.count ?? payload?.unreadCount ?? 0);
      setUnreadCount(Number.isFinite(count) ? count : 0);
    } catch (countError) {
      console.error("Failed to fetch unread count:", countError);
    }
  };

  useEffect(() => {
    fetchNotifications({ page: 0, reset: true });
    fetchUnreadCount();

    const timer = setInterval(() => {
      fetchNotifications({ page: 0, reset: true });
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && !hasLoaded) {
      fetchNotifications({ page: 0, reset: true });
      return;
    }

    if (nextOpen) {
      fetchNotifications({ page: 0, reset: true });
      fetchUnreadCount();
    }
  };

  const handleMarkRead = async (notificationId) => {
    if (String(notificationId).startsWith("temp-")) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }

    try {
      await notificationService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (markError) {
      console.error("Failed to mark notification as read:", markError);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.isRead);
    if (unread.length === 0) return;

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllRead();
    } catch (markError) {
      console.error("Failed to mark all notifications as read:", markError);
    }
  };

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        className="notification-trigger"
        onClick={handleToggle}
        aria-label="Mở thông báo"
      >
        <FiBell size={20} />
        {(unreadCount || unreadCountFromList) > 0 && (
          <span className="notification-badge">
            {(unreadCount || unreadCountFromList) > 99
              ? "99+"
              : unreadCount || unreadCountFromList}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown animate-scale-in">
          <div className="notification-header">
            <h4>Thông báo</h4>
            <div className="notification-header-actions">
              <button
                className="notification-action-btn"
                onClick={() => fetchNotifications({ page: 0, reset: true })}
                disabled={loading}
                title="Tải lại"
              >
                <FiRefreshCw size={14} />
              </button>
              <button
                className="notification-action-btn"
                onClick={handleMarkAllRead}
                title="Đánh dấu đã đọc"
              >
                <FiCheck size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="notification-state">Đang tải thông báo...</div>
          ) : error ? (
            <div className="notification-state error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="notification-state">Chưa có thông báo nào</div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                  onClick={() => handleMarkRead(notification.id)}
                >
                  <div className="notification-item-title-row">
                    <span className="notification-item-title">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span className="notification-item-dot" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="notification-item-message">
                      {notification.message}
                    </p>
                  )}
                  {notification.createdAt && (
                    <span className="notification-item-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  )}
                </button>
              ))}
              {pageInfo.hasNext && (
                <button
                  type="button"
                  className="notification-load-more"
                  onClick={() =>
                    fetchNotifications({
                      page: pageInfo.page + 1,
                      reset: false,
                    })
                  }
                  disabled={loading}
                >
                  {loading ? "Đang tải..." : "Tải thêm"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
