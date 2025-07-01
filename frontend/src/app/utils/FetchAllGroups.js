export async function FetchAllGroups() {
  try {
    const response = await fetch("http://localhost:8080/api/FetchAllGroups", {
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
    console.log("Fetched groups:", data);
    
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching groups:", e);
    return [];
  }
}