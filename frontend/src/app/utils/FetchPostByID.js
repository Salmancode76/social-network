export async function FetchPostByID(id,setPost) {
  try{
    const response = await fetch(`http://localhost:8080/api/ViewPost?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();

    setPost(data.Post);
  }catch(e){
    console.error("Error: ", e);  
    throw e;

  }

}
