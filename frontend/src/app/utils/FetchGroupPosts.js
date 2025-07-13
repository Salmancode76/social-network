export async function FetchPostsGroup(groupId) {
  try {
    const response = await fetch(`http://localhost:8080/api/FetchGroupPosts?group_id=${groupId}`, {
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
    console.log("Fetched group posts:", data);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching group posts:", error);
    return [];
  }
}


export async function CreateGroupPost(postData) {
  try {
    const response = await fetch("http://localhost:8080/api/CreateGroupPost", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error creating post:", err);
    return null;
  }
}




export async function CreateGroupComment(data) {
  try {
    const response = await fetch("http://localhost:8080/api/CreateGroupComment", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create group comment");
    return await response.json();
  } catch (error) {
    console.error("Error creating group comment:", error);
    return null;
  }
}
