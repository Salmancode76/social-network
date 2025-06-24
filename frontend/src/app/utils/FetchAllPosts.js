"use server"
export async function FetchAllPosts( ) {
  try{
  const response = await fetch("http://localhost:8080/api/FetchAllPosts", {
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
  //console.table(data.Posts)
  return data.Posts;
}catch(e){
    console.error("Error: ",e);  
    throw e;
}
}
