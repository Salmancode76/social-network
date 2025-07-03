export async function FetchUserByID(id) {
     try{
       const response = await fetch(`http://localhost:8080/api/FetchUserByID?id=${id}`,{
          method: "GET",
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