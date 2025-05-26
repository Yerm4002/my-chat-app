import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/chat");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed: " + error.message);
    }
  };

 return (
    <div className="auth-container">
      <h2>Welcome to Firebase chat</h2>
      <button onClick={handleLogin} className="auth-button">
        Login with Google
      </button>
      <p>
        Don't have an account? <span onClick={() => navigate("/signup")} className="auth-link">Sign up</span>
      </p>
    </div>
  );
}
