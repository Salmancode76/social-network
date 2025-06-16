"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [error,setError] = useState(false);
  const [ErrorType, setErrorType] = useState(null);
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
   
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();


    const loginData = {
      email: formData.email,
      password: formData.password,
    };
  
    if (!error && !formError) {
      try {
        const result = await fetch("http://localhost:8080/api/Login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        });
        const data = await result.json();

        if (data.status === "ok"){
          router.push("/");

        }else if (data.status === "401"){
          setFormError(data.message);
          return
        }
      
      } catch (e) {
        console.error(e);
        setErrorType(e);
      }
    }
  }
  return (
    <div>
        <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label> <br />
        <input
         type="email"
         name="email"
         value={formData.email}
         onChange={(e) => {
           setFormData({ ...formData, email: e.target.value });
           setFormError("");

         }}
         required /> <br />
        <label>Password:</label> <br />
        <input
        type="password"
        name="password"
        value={formData.password}
         onChange={(e) => {
           setFormData({ ...formData, password: e.target.value });
           setFormError("");

         }}
         /> <br />
         < br/>
          {formError && (
          <p style={{ color: "red", marginTop: "-10px" }}>{formError}</p>
        )}
        <button>Login</button>
      </form>
      <Link href="/Register">You don't have an account?</Link>
   
    </div>
  );
}
