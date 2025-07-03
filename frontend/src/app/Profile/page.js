"use client";
import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";


export default function ProfilePage(){

    const router = useRouter();
     useEffect(() => {
        async function checkSession() {
          try {
            const res = await fetch("http://localhost:8080/api/check-session", {
              credentials: "include",
            });
    
            if (!res.ok) {
              router.push("/auth");
            }
          } catch (error) {
            console.error("Session check failed:", error);
            router.push("/auth");
          }
        }
    
        checkSession();
      }, [router]);

      const response = await fetch(
        ``
      )
    return (
        <div>
            profile
        </div>
    )
}