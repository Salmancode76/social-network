export async function FetchUserIDbySession() {
     try{
       const response = await fetch(`http://localhost:8080/api/GetUserIDFromSession`,{
          method: "GET",
          credentials: "include",
           headers: {
            "Content-Type": "application/json",
        },
        });
        if (!response.ok){
                throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      }catch(e){
        console.error("Error: ", e);  
         throw e;
      }
    
}