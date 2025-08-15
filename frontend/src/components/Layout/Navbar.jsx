import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHome, FaBriefcase, FaFileAlt, FaPlus, FaList } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [category, setCategory] = useState("");
  const [county, setCounty] = useState("");
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();
  const location = useLocation();

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
    "Other Informal Jobs"
  ];

  const counties = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
    "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
    "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
    "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
    "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
  ];

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
    if (category || county) {
      navigateTo(`/job/search?category=${encodeURIComponent(category)}&county=${encodeURIComponent(county)}`);
      setCategory("");
      setCounty("");
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
                    {user?.role === "Employer" ? "Applicant's Applications" : "My Applications"}
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
        </ul>

        {/* Search by Category & County */}
        {user?.role === "Job Seeker" && location.pathname.startsWith("/job") && (
          <form className="search-bar" onSubmit={handleSearch}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>

            <select value={county} onChange={(e) => setCounty(e.target.value)}>
              <option value="">Select County</option>
              {counties.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>

            <button type="submit">Search</button>
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
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <div className="hamburger">
          <GiHamburgerMenu onClick={() => setShow(!show)} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
