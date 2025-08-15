import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHome, FaBriefcase, FaFileAlt, FaPlus, FaList, FaEnvelope } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthorized) {
      fetchUser();
    }
  }, [isAuthorized]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
        { withCredentials: true }
      );
      setUser(response.data.user);
      setIsAuthorized(true);
    } catch (error) {
      setIsAuthorized(false);
    }
  };

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigateTo(`/job/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
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
                  <span className="nav-text">Home</span>
                </Link>
              </li>
              <li>
                <Link to="/job/getall" onClick={() => setShow(false)}>
                  <FaBriefcase className="nav-icon" />
                  <span className="nav-text">Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/applications/me" onClick={() => setShow(false)}>
                  <FaFileAlt className="nav-icon" />
                  <span className="nav-text">
                    {user?.role === "Employer"
                      ? "Applicant's Applications"
                      : "My Applications"}
                  </span>
                </Link>
              </li>
              {user?.role === "Employer" && (
                <>
                  <li>
                    <Link to="/job/post" onClick={() => setShow(false)}>
                      <FaPlus className="nav-icon" />
                      <span className="nav-text">Post Job</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/job/me" onClick={() => setShow(false)}>
                      <FaList className="nav-icon" />
                      <span className="nav-text">Your Jobs</span>
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
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>
          )}

          <li>
            <Link to="/contact" onClick={() => setShow(false)}>
              <FaEnvelope className="nav-icon" />
              <span className="nav-text">Contact Us</span>
            </Link>
          </li>
        </ul>

        {/* Search bar for Job Seekers */}
        {user?.role === "Job Seeker" && location.pathname.startsWith("/job") && (
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by salary, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        )}

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