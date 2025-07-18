import { MarkNotificationAsRead } from "./MarkAsRead";
export function NotificationContainer({
  notifications = [],
  showNotifications = false,
  setNotificationCount,
  manageRequest,
  manageInvites,
}) {
  return (
    <div className={`notification-dropdown ${showNotifications ? "show" : ""}`}>
      <div className="notification-header">
        <div className="notification-title">Notifications</div>
        <div
          className="mark-all-read"
          onClick={() => {
            setNotificationCount(0);
            MarkNotificationAsRead(notifications);
          }}
        >
          Mark all as read
        </div>
      </div>
      {console.table(notifications)}
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="empty-text">No notifications yet</div>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-item ${!n.is_read ? "unread" : ""}`}
            >
              <div className="notification-icon">
                {n.notification_type_id === 2
                  ? "📩"
                  : n.notification_type_id === 3
                  ? "➕"
                  : n.notification_type_id === 4
                  ? "🎉"
                  : n.notification_type_id === 5
                  ? "👥"
                  : "🔔"}
              </div>
              <div className="notification-content">
                {n.notification_type_id === 3 ? (
                  <div>
                    <div className="notification-text">
                      <strong>{n.user_fullName}</strong> requested to join{" "}
                      <strong>{n.group_title}</strong>
                    </div>
                    <div className="notification-time">Just now</div>
                    <div className="notification-actions">
                      <button
                        className="accept-btn"
                        onClick={() =>
                          manageRequest(
                            n.id,
                            n.related_group_id,
                            n.user_id,
                            true
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() =>
                          manageRequest(
                            n.id,
                            n.related_group_id,
                            n.user_id,
                            false
                          )
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ) : n.notification_type_id === 2 ? (
                  <div>
                    <div className="notification-text">
                      <strong>{n.user_fullName}</strong> invited you to join{" "}
                      <strong>{n.group_title}</strong>
                    </div>
                    <div className="notification-time">Just now</div>
                    <div className="notification-actions">
                      <button
                        className="accept-btn"
                        onClick={() =>
                          manageInvites(
                            n.id,
                            n.related_group_id,
                            n.related_user_id,
                            true
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() =>
                          manageInvites(
                            n.id,
                            n.related_group_id,
                            n.related_user_id,
                            false
                          )
                        }
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ) : n.notification_type_id === 5 ? (
                  <div>
                    <div className="notification-text">
                      <div className="notification-text">{n.message}</div>
                    </div>
                    <div className="notification-time">Just now</div>
                    <div className="notification-actions">
                      <button
                        className="accept-btn"
                     
                      >
                        Accept
                      </button>
                      <button
                        className="decline-btn"
                 
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="notification-text">{n.message}</div>
                    <div className="notification-time">Just now</div>
                  </div>
                )}
              </div>
              {!n.is_read && <div className="notification-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const fetchNotifications = async (
  userID,
  setNotifications,
  setNotificationCount
) => {
  if (!userID) return;

  try {
    const response = await fetch(
      "http://localhost:8080/api/GetAllNotifications",
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const notificationsList = data.Notifications || [];
    setNotifications(notificationsList);

    const unreadCount = notificationsList.filter((n) => !n.is_read).length;
    setNotificationCount(unreadCount);
  } catch (e) {
    console.error("Error fetching notifications:", e);
  }
};
