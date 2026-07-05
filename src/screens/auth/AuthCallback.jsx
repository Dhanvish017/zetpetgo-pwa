import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeLogin } from "../../lib/authFlow";
import "../login/LoginScreen.css";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    completeLogin(navigate);
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <p className="login-subtitle">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
