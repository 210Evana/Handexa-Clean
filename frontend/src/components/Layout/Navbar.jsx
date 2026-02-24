import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../../main";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  FaHome,
  FaBriefcase,
  FaFileAlt,
  FaPlus,
  FaList,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [category, setCategory] = useState("");
  const [county, setCounty] = useState("");

  const { isAuthorized, setIsAuthorized, user, setUser } =
    useContext(Context);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  /* ========================
     FETCH USER (COOKIE AUTH)
     ======================== */
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
          { withCredentials: true }
        );
        setUser(data.user);
        setIsAuthorized(true);
      } catch {
        setUser(null);
        setIsAuthorized(false);
      }
    };

    fetchUser();
  }, [isAuthorized, setIsAuthorized, setUser]);

  /* ========================
     CLOSE DROPDOWN ON OUTSIDE CLICK
     ======================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ========================
     LOGOUT
     ======================== */
  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );
      toast.success(data.message);
      setUser(null);
      setIsAuthorized(false);
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  /* ========================
     SEARCH
     ======================== */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!category && !county) return;

    navigate(
      `/job/search?category=${encodeURIComponent(
        category
      )}&county=${encodeURIComponent(county)}`
    );

    setCategory("");
    setCounty("");
  };

  /* ========================
     DATA
     ======================== */
  const categories = [
    "Cleaning & Domestic Services",
    "Chefs & Cooks",
    "Nannies",
    "Photographers",
    "Househelps",
    "Laundry Services",
    "Construction",
    "Artisans",
    "Gardeners",
    "Electrical & Wiring Services",
    "Tailoring & Fashion Design",
    "Carpentry & Furniture Making",
    "Plumbing & Repairs",
    "Masseuse/Masseur",
    "Event Planners",
    "Nail Technicians",
    "Make Up Artists",
    "Fumigators",
    "Painter",
    "Drivers",
    "Farming & Agriculture",
    "Food Vending & Catering",
    "Other Informal Jobs",
  ];

  const counties = [
    "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
    "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
    "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu",
    "Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa",
    "Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua",
    "Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi",
    "Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot",
  ];

  /* ========================
     RENDER
     ======================== */
  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="container">
        {/* LOGO */}
        <h1 className="logo-text">
          <span className="logo-hand">Hand</span>
          <span className="logo-exa">Exa</span>
        </h1>

        {/* MENU */}
        <ul className={`menu ${showMenu ? "show-menu" : ""}`}>
          {user?.role !== "Admin" && (
            <>
              <li>
                <Link to="/" onClick={() => setShowMenu(false)}>
                  <FaHome /> Home
                </Link>
              </li>
              <li>
                <Link to="/job/getall" onClick={() => setShowMenu(false)}>
                  <FaBriefcase /> Jobs
                </Link>
              </li>
              <li>
                <Link to="/applications/me" onClick={() => setShowMenu(false)}>
                  <FaFileAlt /> Applications
                </Link>
              </li>

              {user?.role === "Employer" && (
                <>
                  <li>
                    <Link to="/job/post" onClick={() => setShowMenu(false)}>
                      <FaPlus /> Post Job
                    </Link>
                  </li>
                  <li>
                    <Link to="/job/me" onClick={() => setShowMenu(false)}>
                      <FaList /> My Jobs
                    </Link>
                  </li>
                </>
              )}
            </>
          )}

          {user?.role === "Admin" && (
            <li>
              <Link to="/admin/dashboard">
                <FaHome /> Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* SEARCH */}
        {user?.role === "Job Seeker" &&
          location.pathname.startsWith("/job") && (
            <form className="search-bar" onSubmit={handleSearch}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Category</option>
                {categories.map((c, i) => (
                  <option key={i}>{c}</option>
                ))}
              </select>

              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              >
                <option value="">County</option>
                {counties.map((c, i) => (
                  <option key={i}>{c}</option>
                ))}
              </select>

              <button type="submit">Search</button>
            </form>
          )}

        {/* PROFILE DROPDOWN */}
        {isAuthorized && user && (
          <div className="profile-section" ref={dropdownRef}>
            <button
              className="profile-trigger"
              onClick={() =>
                setShowProfileDropdown((prev) => !prev)
              }
              aria-haspopup="true"
              aria-expanded={showProfileDropdown}
            >
              <img
                src={user.avatar?.url || "/default-profile.png"}
                className="profile-pic"
                alt="profile"
              />
              <span className="user-name">{user.name}</span>
              <FaChevronDown
                className={`dropdown-arrow ${
                  showProfileDropdown ? "open" : ""
                }`}
              />
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-email">{user.email}</p>
                  <span className="dropdown-role">{user.role}</span>
                </div>

                <div className="dropdown-divider" />

               <ul className="profile-nav-menu">
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaUser /> Edit Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-logout">
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* HAMBURGER */}
        <div className="hamburger">
          <GiHamburgerMenu onClick={() => setShowMenu(!showMenu)} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
