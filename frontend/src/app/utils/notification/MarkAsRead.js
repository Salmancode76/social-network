export async function MarkNotificationAsRead(notifications) {
  try {
    const ids = notifications.map((n) => n.id);
    console.table(ids);

    const response = await fetch(
      "http://localhost:8080/api/MarkNotificationAsRead",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }), 
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (e) {
    console.error("Error: ", e);
    throw e;
  }
}