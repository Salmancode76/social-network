import { useRouter } from "next/navigation";

async function CheckSession(router) {
  try {
    const res = await fetch("http://localhost:8080/api/check-session", {
      credentials: "include",
    });

    const data = await res.json();
    
    if (data.authenticated == false) {
      router.push("/auth");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Session check failed:", error);
    router.push("/auth");
    return false;
  }
}

export default CheckSession;
