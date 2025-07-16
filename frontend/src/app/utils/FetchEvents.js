// utils/FetchEvents.js
import { WS_URL } from "../utils/ws";
import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";

export async function FetchEvents(groupId) {
  try {
    const response = await fetch(`http://localhost:8080/api/FetchEvents?groupId=${groupId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched events:", data);

    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching events:", e);
    return [];
  }
}

export async function CreateEvent(event) {
  try {
    const ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
      const data = await FetchUserIDbySession();
      const userID = data.UserID;

      const eventCreated = {
        type: "createEvent",
        title: event.title,
        description: event.description,
        group_id: event.group_id,
        event_datetime: event.event_datetime,
        creator_id: userID,
      };

      ws.send(JSON.stringify(eventCreated));
    };

    return true;
  } catch (error) {
    console.error("Error creating event:", error);
    return false;
  }
}


export async function OptionsEvent(eventId, choice) {
  try {
    const response = await fetch("http://localhost:8080/api/OptionsEvent", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_id: eventId,
        choice: choice,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit RSVP");
    }

    return true;
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    return false;
  }
}
