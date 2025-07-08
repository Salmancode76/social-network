// utils/FetchEvents.js

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
    const response = await fetch("http://localhost:8080/api/CreateEvent", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error("Failed to create event");
    }

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
