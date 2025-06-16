"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [error,setError] = useState(false);
  const [ErrorType, setErrorType] = useState(null);
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    nickname: "",
    email: "",
    date: "",
    password: "",
    Repassword: "",
    Is_Public: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const registerData = {
      first_name: formData.fname,
      last_name: formData.lname,
      nickname: formData.nickname,
      email: formData.email,
      date_of_birth: formData.date,
      password: formData.password,
      is_public: formData.Is_Public,
    };

    if (!error && !formError) {
      try {
        const result = await fetch("http://localhost:8080/api/Register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
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
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>First name:</label> <br />
        <input
          type="text"
          name="fname"
          value={formData.fname}
          onChange={(e) => {
            setFormData({ ...formData, fname: e.target.value });
          }}
          required
        />{" "}
        <br />
        <label>Last name:</label> <br />
        <input
          type="text"
          name="lname"
          value={formData.lname}
          onChange={(e) => {
            setFormData({ ...formData, lname: e.target.value });
          }}
          required
        />{" "}
        <br />
        <label>Nickname:</label> <br />
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={(e) => {
            setFormData({ ...formData, nickname: e.target.value });
            if (formError) setFormError("");
          }}
          required
        />{" "}
        <br />
        <label>Email:</label> <br />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setFormError("");
          }}
          required
        />{" "}
        <br />
        <label>Date of Birth:</label> <br />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={(e) => {
            setFormData({ ...formData, date: e.target.value });
          }}
          required
        />{" "}
        <br />
        <label>Password:</label> <br />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => {
            const newPass = e.target.value;
            setFormData({ ...formData, password: newPass });

            if (formData.Repassword && formData.Repassword !== newPass) {
              setFormError("Passwords do not match");
            } else {
              setFormError("");
            }
          }}
          required
        />{" "}
        <br />
        <label>Password Confirm:</label> <br />
        <input
          type="password"
          name="Repassword"
          value={formData.Repassword}
          onChange={(e) => {
            const rePass = e.target.value;
            setFormData({ ...formData, Repassword: rePass });

            if (formData.password && formData.password !== rePass) {
              setFormError("Passwords do not match");
            } else {
              setFormError("");
            }
          }}
          required
        />{" "}
        <br />
        <br />
        {formError && (
          <p style={{ color: "red", marginTop: "-10px" }}>{formError}</p>
        )}
        <label>Privacy:</label> <br />
        <label>
          <input
            type="radio"
            name="is_Public"
            value="1"
            onChange={(e) => {
              setFormData({ ...formData, Is_Public: e.target.value });
            }}
            required
          />
          Public <br />
        </label>
        <label>
          <input
            type="radio"
            name="is_Public"
            value="0"
            onChange={(e) => {
              setFormData({ ...formData, Is_Public: e.target.value });
            }}
            required
          />
          Private <br />
        </label>
        {/* Avatar will adding later */}
        <button>Register</button>
      </form>
      <Link href="/Login">You have already an account?</Link>
    </div>
  );
}
