import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoCall } from "react-icons/io5";
import axios from "axios";
import "./LoginScreen.css";

const LoginScreen = () => {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);

  const countryCode = "+91";

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(
        () => setResendTimer(resendTimer - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setPhoneNumber(cleaned);

    if (error && cleaned.length >= 10) {
      setError("");
    }
  };

  const sendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        "https://vetcare-1.onrender.com/send-otp",
        {
          phone: `${countryCode}${phoneNumber}`,
        }
      );

      setOtpSent(true);
      setResendTimer(30);

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 300);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "");

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "https://vetcare-1.onrender.com/verify-otp",
        {
          phone: `${countryCode}${phoneNumber}`,
          otp: otpCode,
        }
      );

      const { token, isProfileComplete } = res.data;

      localStorage.setItem("token", token);

      navigate(
        isProfileComplete
          ? "/dashboard"
          : "/create-account"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <div className="header">
          <IoCall size={60} />
          <h1>ZetPetGo</h1>
          <p>Secure access with OTP verification</p>
        </div>

        <div className="input-group">
          <label>Mobile Number</label>

          <div className="phone-row">
            <div className="country-code">
              {countryCode}
            </div>

            <input
              type="text"
              maxLength="10"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit number"
            />
          </div>
        </div>

        {otpSent && (
          <div className="otp-section">

            <label>Enter OTP</label>

            <p className="otp-hint">
              We've sent a 4-digit code to
              {" "}
              {countryCode} {phoneNumber}
            </p>

            <div className="otp-container">

              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  className="otp-input"
                  maxLength="1"
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(
                      e.target.value,
                      index
                    )
                  }
                />
              ))}

            </div>

            <button
              className="link-btn"
              disabled={resendTimer > 0}
              onClick={sendOTP}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : "Resend OTP"}
            </button>

          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <button
          className="primary-btn"
          onClick={otpSent ? verifyOTP : sendOTP}
        >
          {loading
            ? "Loading..."
            : otpSent
              ? "Verify OTP"
              : "Send OTP"}
        </button>

      </div>

    </div>
  );
};

export default LoginScreen;