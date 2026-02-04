import React, { useContext, useState } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`,
        { email, password, role },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      toast.success(data.message);
      setUser(data.user);
      setEmail("");
      setPassword("");
      setRole("");
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  // Redirect based on role
  if (isAuthorized && user) {
    if (user.role === "Admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  if (isAuthorized) return <Navigate to="/" />;

  return (
    <>
      <section className="authPage auth-login">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="brand-wrapper">
                <h1 className="brand-name">
                  <span className="brand-hand">HAND</span>
                  <span className="brand-exa">EXA</span>
                </h1>
                <div className="brand-tagline">Connecting Informal Workers & Employers</div>
              </div>
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-subtitle">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Account Type
                </label>
                <div className="input-wrapper">
                  <FaRegUser className="input-icon" />
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="form-select"
                  >
                    <option value="">Select your role</option>
                    <option value="Employer">Employer</option>
                    <option value="Job Seeker">Job Seeker</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <MdOutlineMailOutline className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input password-input"
                    aria-label="Password"
                  />
                    <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {/* When password is visible (showPassword=true), show EyeSlash to hide it */}
                    {/* When password is hidden (showPassword=false), show Eye to reveal it */}
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button">
                Sign In
              </button>

              <div className="auth-footer">
                <p className="footer-text">
                  Don't have an account?{" "}
                  <Link to="/register" className="footer-link">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="auth-visual">
            <div className="visual-content">
              <div className="visual-overlay"></div>
              <img src="/login.avif" alt="Professional workspace" className="visual-image" />
              <div className="visual-text">
                <h3>Your Skills, Your Success</h3>
                <p>Join thousands of informal workers finding fair opportunities and building lasting connections with employers who value your expertise.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;