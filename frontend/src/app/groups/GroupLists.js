"use client";
import { useState, useEffect } from "react";
import { FetchAllGroups } from "../utils/FetchAllGroups";
import "./group.css";
import { WS_URL } from "../utils/ws";
import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function GroupLists({ onGroupClick }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatuses, setRequestStatuses] = useState({}); // Track per group

  const { socket } = useWebSocket();

  const sendWebSocketMessage = async (group) => {
    if (!('WebSocket' in window)) {
      console.error('WebSockets are not supported by your browser.');
      return;
    }

    //const socket  = new WebSocket(WS_URL);

    const data = await FetchUserIDbySession();
    const userID = data.UserID;
    console.log('WebSocket connected! User ID:', userID);

    const message = {
      type: 'get_group_chat_history',
      to: group.id,
      from: userID,
    };

    socket.send(JSON.stringify(message));
    console.log('JSON WebSocket message sent:', message);

  }



  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedGroups = await FetchAllGroups();
      console.table("Groups received:", fetchedGroups);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setError("Failed to load groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    if (onGroupClick) {
      onGroupClick(group);
    }
  };

  const handleRequestToJoin = async (id, creator_id) => {
    try {
      setRequestStatuses((prev) => ({ ...prev, [id]: "pending" }));

      /*
      const response = await fetch(
        `http://localhost:8080/api/RequestJoin?id=${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      */

      const data = await FetchUserIDbySession();
      const userID = data.UserID;
      console.log("WebSocket connected! User ID:", userID);
      const request = {
        type: "sendRequestToJoinGroup",
        related_user_id: parseInt(userID),
        related_group_id: parseInt(id),
        creator_id: parseInt(creator_id),
      };
      console.table(request);
      socket.send(JSON.stringify(request));


      setRequestStatuses((prev) => ({ ...prev, [id]: "requested" }));
    } catch (e) {
      console.error("Error: ", e);
      setRequestStatuses((prev) => ({ ...prev, [id]: "error" }));

      setTimeout(() => {
        setRequestStatuses((prev) => ({ ...prev, [id]: null }));
      }, 3000);
    }
  };

  const getButtonContent = (groupId, requestStatus) => {
    switch (requestStatus) {
      case "pending":
        return { text: "Sending...", disabled: true };
      case "requested":
        return { text: "Request Sent", disabled: true };
      case "error":
        return { text: "Error - Try Again", disabled: false };
      default:
        return { text: "+ Request to join", disabled: false };
    }
  };

  if (loading) {
    return (
      <div className="group-list-container">
        <div className="loading-message">Loading groups...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-list-container">
        <div className="loading-message">{error}</div>
        <button onClick={fetchGroups} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="group-list-container">
      <div className="group-list">
        {groups.length > 0 ? (
          groups.map((group) => {
            const requestStatus = requestStatuses[group.id];
            const buttonInfo = getButtonContent(group.id, requestStatus);

            return (
              <div
                key={group.id}
                className="group-item clickable"
                onClick={() => {
                  if (group.isMember &&
                    group.request_status_id != "1"
                  ) {
                    handleGroupClick(group)
                    sendWebSocketMessage(group);
                    console.log("Group clicked:", group.id);
                  }

                }
                }
              >
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <small>
                  Created: {new Date(group.created_at).toLocaleDateString()}
                </small>
                <div>
                  {!group.isMember && !group.isInvited ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!buttonInfo.disabled) {
                          handleRequestToJoin(group.id, group.creator_id);
                        }
                      }}
                    >
                      <div className="form-submit-wrapper">
                        <button
                          type="submit"
                          disabled={buttonInfo.disabled}
                          className={requestStatus === "error" ? "error-button" : ""}
                        >
                          {buttonInfo.text}
                        </button>
                      </div>
                    </form>

                  ) : (
                    <div>
                      {group.request_status_id === "1" ? (
                        <span className="member-label">Your are invited</span>
                      ) : group.request_status_id === "5" ? (
                        <span className="member-label">Your group</span>
                      ) : group.request_status_id === "2" ? (
                        <span className="member-label">
                          You are part of this group
                        </span>
                      ) : group.request_status_id === "3" ? (
                        <span className="member-label">
                          Your request is sent
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="group-item">
            No groups found. Create your first group!
          </div>
        )}
      </div>
    </div>
  );
}
