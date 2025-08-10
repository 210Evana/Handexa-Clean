import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHome, FaBriefcase, FaFileAlt, FaPlus, FaList } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  // Debug user data and state
  useEffect(() => {
    console.log("Navbar user:", user);
    console.log("Navbar isAuthorized:", isAuthorized);
  }, [user, isAuthorized]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
       `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
        { withCredentials: true }
      );
      console.log("Fetch user response:", response.data);
      setUser(response.data.user);
      setIsAuthorized(true);
    } catch (error) {
      console.error("Fetch user error:", error);
      setIsAuthorized(false);
    }
  };

  // ✅ fetch user when navbar loads
  useEffect(() => {
    if (isAuthorized) {
      fetchUser();
    }
  }, [isAuthorized]);

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      setIsAuthorized(true);
    }
  };

  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="container">
        <h1 className="logo-text m-0">
          <span className="logo-hand">Hand</span>
          <span className="logo-exa">Exa</span>
        </h1>

        <ul className={!show ? "menu" : "show-menu menu"}>
          {user?.role !== "Admin" && (
            <>
              <li>
                <Link to="/" onClick={() => setShow(false)}>
                  <FaHome className="nav-icon" />
                  <span className="nav-text">home</span>
                </Link>
              </li>
              <li>
                <Link to="/job/getall" onClick={() => setShow(false)}>
                  <FaBriefcase className="nav-icon" />
                  <span className="nav-text">all jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/applications/me" onClick={() => setShow(false)}>
                  <FaFileAlt className="nav-icon" />
                  <span className="nav-text">
                    {user?.role === "Employer"
                      ? "applicant's applications"
                      : "my applications"}
                  </span>
                </Link>
              </li>
              {user?.role === "Employer" && (
                <>
                  <li>
                    <Link to="/job/post" onClick={() => setShow(false)}>
                      <FaPlus className="nav-icon" />
                      <span className="nav-text">post new job</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/job/me" onClick={() => setShow(false)}>
                      <FaList className="nav-icon" />
                      <span className="nav-text">view your jobs</span>
                    </Link>
                  </li>
                </>
              )}
            </>
          )}

          {user?.role === "Admin" && (
            <li>
              <Link to="/admin/dashboard" onClick={() => setShow(false)}>
                <FaHome className="nav-icon" />
                <span className="nav-text">admin dashboard</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="profile-section">
          <div className="profile-container">
            <img
              src={user?.avatar?.url || "/default-profile.png"}
              alt="Profile"
              className="profile-pic"
            />
            <span className="user-name">{user?.name || "Guest"}</span>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="hamburger">
          <GiHamburgerMenu onClick={() => setShow(!show)} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;