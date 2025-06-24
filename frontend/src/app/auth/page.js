"use client";
import { useEffect, useState } from "react";

import "../styles/auth.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

   useEffect(() => {
    async function checkSession() {
      const res = await fetch("http://localhost:8080/api/check-session", {
        credentials: "include",
      });

      if (res.ok) {
        router.push("/"); 
      }
    }

    checkSession();
  }, []);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fname: "",
    lname: "",
    nickname: "",
    email: "",
    date: "",
    password: "",
    repassword: "",
    is_public: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const switchTo = (type) => {
    setErrorMsg("");
    setIsLogin(type === "login");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.status === "ok"){
window.dispatchEvent(new Event("session-changed"));

        router.push("/");
      }
        else setErrorMsg(data.message || "Login failed");
    } catch (err) {
      setErrorMsg("Login error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.repassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    const payload = {
      first_name: registerForm.fname,
      last_name: registerForm.lname,
      nickname: registerForm.nickname,
      email: registerForm.email,
      date_of_birth: registerForm.date,
      password: registerForm.password,
      is_public: registerForm.is_public,
    };

    try {
      const res = await fetch("http://localhost:8080/api/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "ok") router.push("/");
      else setErrorMsg(data.message || "Registration failed");
    } catch (err) {
      setErrorMsg("Registration error");
    }
  };

  return (
    <section className="forms-section">
      <h1 className="section-title">Welcome</h1>
      <div className="forms">
        <div className={`form-wrapper ${isLogin ? "is-active" : ""}`}>
          <button
            type="button"
            className={`switcher switcher-login ${isLogin ? "active-tab" : ""}`}
            onClick={() => switchTo("login")}
          >
            Login
            <span className="underline"></span>
          </button>
          <form className="form form-login" onSubmit={handleLogin}>
            <fieldset>
              <legend>Login</legend>
              <div className="input-block">
                <label htmlFor="login-email">Username or Email</label>
                <input
                  id="login-email"
                  type="text"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-block">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />
              </div>
              {errorMsg && isLogin && <p className="error-message">{errorMsg}</p>}
            </fieldset>
            <button type="submit" className="btn-login">LOGIN</button>
            <div className="switch-link">
              <a href="#" onClick={() => switchTo("register")}>Do not have an account? Sign up</a>
            </div>
          </form>
        </div>

        <div className={`form-wrapper ${!isLogin ? "is-active" : ""}`}>
          <button
            type="button"
            className={`switcher switcher-signup ${!isLogin ? "active-tab" : ""}`}
            onClick={() => switchTo("register")}
          >
            Sign Up
            <span className="underline"></span>
          </button>
          <form className="form form-signup" onSubmit={handleRegister}>
            <fieldset>
              <legend>Register</legend>
              <div className="input-block">
                <label>First Name</label>
                <input
                  type="text"
                  value={registerForm.fname}
                  onChange={(e) => setRegisterForm({ ...registerForm, fname: e.target.value })}
                  required
                />
              </div>
              <div className="input-block">
                <label>Last Name</label>
                <input
                  type="text"
                  value={registerForm.lname}
                  onChange={(e) => setRegisterForm({ ...registerForm, lname: e.target.value })}
                  required
                />
              </div>
              <div className="input-block">
                <label>Nickname</label>
                <input
                  type="text"
                  value={registerForm.nickname}
                  onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                  
                />
              </div>
              <div className="input-block">
                <label>Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-block">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={registerForm.date}
                  onChange={(e) => setRegisterForm({ ...registerForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="input-block">
                <label>Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="input-block">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={registerForm.repassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, repassword: e.target.value })}
                  required
                />
              </div>
              <div className="input-block">
                <label>Privacy</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="is_public"
                      value="1"
                      onChange={(e) => setRegisterForm({ ...registerForm, is_public: e.target.value })}
                      required
                    />
                    Public
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="is_public"
                      value="0"
                      onChange={(e) => setRegisterForm({ ...registerForm, is_public: e.target.value })}
                      required
                    />
                    Private
                  </label>
                </div>
              </div>
              {errorMsg && !isLogin && <p className="error-message">{errorMsg}</p>}
            </fieldset>
            <button type="submit" className="btn-signup">SIGN UP</button>
            <div className="switch-link">
              <a href="#" onClick={() => switchTo("login")}>Already have an account? Login</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
