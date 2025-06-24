export async function FetchAllUsers() {
    
    try{
        const response = await fetch(
          "http://localhost:8080/api/FetchAllUsers",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.table(data);

        return data.Users || [];
        }catch(e){
          console.error("Error: ", e);
          throw e;
    }
}