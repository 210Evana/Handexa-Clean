import React, { useContext, useState } from "react";
import { FaRegUser, FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./Auth.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
        { name, phone, email, role, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      toast.success(data.message);
      setUser(data.user);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole("");
      setIsAuthorized(true);

      if (data.user.role === "Admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  if (isAuthorized) {
    return <Navigate to={user?.role === "Admin" ? "/admin/dashboard" : "/"} />;
  }

  return (
    <>
      <section className="authPage auth-register">
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
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">Join thousands of workers and employers building successful partnerships</p>
            </div>

            <form onSubmit={handleRegister} className="auth-form">
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
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <div className="input-wrapper">
                  <FaPencilAlt className="input-icon" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                  />
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
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="input-wrapper">
                  <FaPhoneFlip className="input-icon" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button">
                Create Account
              </button>

              <div className="auth-footer">
                <p className="footer-text">
                  Already have an account?{" "}
                  <Link to="/login" className="footer-link">
                    Sign in
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
                <h3>Build Your Network</h3>
                <p>Whether you're a skilled craftsperson, day laborer, or service provider - connect with employers who respect and value your work.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;