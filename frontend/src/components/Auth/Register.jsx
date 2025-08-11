import React, { useContext, useState } from "react";
import { FaRegUser, FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./Auth.css"; // Assuming you have a CSS file for styling

const Register = () => {
  const [email, setEmail] = useState ("");
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
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
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
      toast.error(error.response.data.message || "Registration failed");
    }
  };

  if (isAuthorized) {
    return <Navigate to={user?.role === "Admin" ? "/admin/dashboard" : "/"} />;
  }

  return (
    <>
      <section className="authPage">
        <div className="container">
          <div className="header">
            <div
              className="logo-bg rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: "100px", height: "60px" }}
            >
              <span className="logo-text text-white fs-3">Welcome</span>
            </div>
            <h1 className="logo-text m-0">
              <span className="logo-hand">Hand</span>
              <span className="logo-exa">Exa</span>
            </h1>
            <h3>Create a new account</h3>
          </div>
          
          <form onSubmit={handleRegister}>
            <div className="inputTag">
              <label>Register As</label>
              <div>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                  <option value="">Select Role</option>
                  <option value="Employer">Employer</option>
                  <option value="Job Seeker">Job Seeker</option>
                  
                </select>
                <FaRegUser style={{ fontSize: "1.5rem" }} />
              </div>
            </div>

            <div className="inputTag">
              <label>Name</label>
              <div>
                <input
                  type="text"
                  placeholder="Tavian"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <FaPencilAlt style={{ fontSize: "1.5rem" }} />
              </div>
            </div>

            <div className="inputTag">
              <label>Email Address</label>
              <div>
                <input
                  type="email"
                  placeholder="evanajuma2003@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <MdOutlineMailOutline style={{ fontSize: "1.5rem" }} />
              </div>
            </div>

            <div className="inputTag">
              <label>Phone Number</label>
              <div>
                <input
                  type="tel"
                  placeholder="0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <FaPhoneFlip style={{ fontSize: "1.5rem" }} />
              </div>
            </div>

            <div className="inputTag">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {showPassword ? (
                  <FaEyeSlash
                    
                    onClick={() => setShowPassword(false)}
                    style={{ fontSize: "1.5rem", cursor: "pointer" }}
                  />

                ) : (
                  <FaEye
                    
                    onClick={() => setShowPassword(true)}
                    style={{ fontSize: "1.5rem", cursor: "pointer" }}
                  />
                )}
                
              </div>
            </div>

            <button type="submit">Register</button>
            <Link to={"/login"}>Login Now</Link>
            
                          
          </form>
        </div>

        <div className="banner">
          <img src="/login.avif" alt="login" />
        </div>
      </section>
    </>
  );
};

export default Register;