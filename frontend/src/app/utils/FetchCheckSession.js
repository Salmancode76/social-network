// "use server"
// import { redirect  } from "next/navigation";

// export async function FetchCheckSession() {
//     const cookieStore = cookies(); // 🧁
//   const sessionId = cookieStore.get("session_id")?.value;
     
//    try {
//         const res = await fetch("http://localhost:8080/api/check-session", {
//           credentials: "include",
//            Cookie: `session_id=${sessionId}`,
//         });

//         if (!res.ok) {
//          redirect("/auth");
//         }
//       } catch (error) {
//         console.error("Session check failed:", error);
//         redirect("/auth");
//       }
// }
// export async function FetchCheckSessionForAuth() {
     
//     const res = await fetch("http://localhost:8080/api/check-session", {
//         credentials: "include",
//       });

//       if (res.ok) {
//        redirect("/"); 
//       }
// }