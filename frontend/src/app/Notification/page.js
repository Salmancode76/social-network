"use client";
import { useEffect, useState } from "react";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const fetchNotifications = async () => {
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
      console.log("Fetched notifications:", data);
      return data.Notifications || [];    } catch (e) {
      console.error("Error fetching notifications:", e);
      return [];
    }
  };

  useEffect(() => {
    const getData = async () => {
      const data = await fetchNotifications();
      setNotifications(data);
    };

    getData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notifications</h2>
      {notifications.length === 0 && <p>No notifications found.</p>}
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "10px",
            backgroundColor: n.is_read ? "#f9f9f9" : "#e6f7ff",
          }}
        >
          {n.notification_type_id === 3 && (
            <div>
              User <b>{n.user_fullName}</b> Requested to join{" "}
              <b> {n.group_title}</b> Group
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default NotificationPage;
