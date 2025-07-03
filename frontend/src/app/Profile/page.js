"use client";
import {useSearchParams, useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import { FetchUserByID } from "../utils/FetchUserByID";

export default function ProfilePage(){

  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
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


        const id = searchParams.get("id");

      useEffect(() => {
        async function fetchData() {
          try{
            if (id){
              const data = await FetchUserByID(id);
              setUser(data);
            }

          }catch(e){
            console.error("Failed to load user data:", e);
          }
          
        }
        fetchData();
      },[id]);
      

    return (
        <div>
            
            {user ? (
              <div>
                <img
                src={`http://localhost:8080/Image/Users/${user.User.avatar}`}
                 style={{
                width: "80px",          
                height: "80px",
                borderRadius: "50%",    
                objectFit: "cover",      
                border: "2px solid #ccc" 
                }}
                />
                <h3>{user.User.nickname}</h3>
                <h5>{user.User.about_me}</h5>
              </div>
            ) : (
              <p>Loading</p>
            )

            }
        </div>
    )
}