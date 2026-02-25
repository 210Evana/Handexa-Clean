import React, { useContext, useState, useEffect, useRef } from "react";
import { Context } from "../../main";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  FaHome, FaBriefcase, FaFileAlt, FaPlus,
  FaList, FaUser, FaSignOutAlt, FaChevronDown, FaTimes,
} from "react-icons/fa";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [category, setCategory] = useState("");
  const [county, setCounty] = useState("");

  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const isEmployer = user?.role === "Employer";
  const isJobSeeker = user?.role === "Job Seeker";
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`, { withCredentials: true })
      .then(({ data }) => { setUser(data.user); setIsAuthorized(true); })
      .catch(() => { setUser(null); setIsAuthorized(false); });
  }, [isAuthorized]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );
      toast.success(data.message);
      setUser(null); setIsAuthorized(false);
      navigate("/login");
    } catch { toast.error("Logout failed"); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!category && !county) return;
    navigate(`/job/search?category=${encodeURIComponent(category)}&county=${encodeURIComponent(county)}`);
    setCategory(""); setCounty("");
  };

  const counties = ["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"];
  const categories = ["Cleaning & Domestic Services","Chefs & Cooks","Nannies","Photographers","Househelps","Laundry Services","Construction","Artisans","Gardeners","Electrical & Wiring Services","Tailoring & Fashion Design","Carpentry & Furniture Making","Plumbing & Repairs","Event Planners","Nail Technicians","Make Up Artists","Fumigators","Painter","Drivers","Farming & Agriculture","Food Vending & Catering","Other Informal Jobs"];

  if (!isAuthorized) return null;

  /* ── THEME TOKENS ── */
  const employerTheme = {
    nav: "#0a0f1e", font: "'DM Sans', sans-serif",
    navShadow: scrolled ? "0 4px 30px rgba(0,0,0,.6)" : "none",
    navBorder: scrolled ? "rgba(163,230,53,.12)" : "rgba(255,255,255,.04)",
    logoA: "#fff", logoB: "#a3e635",
    accent: "#a3e635", accentText: "#0a0f1e",
    linkColor: "rgba(232,234,242,.7)", linkHoverColor: "#a3e635", linkHoverBg: "rgba(163,230,53,.07)",
    pillBg: "rgba(163,230,53,.1)", pillBorder: "rgba(163,230,53,.3)", pillColor: "#a3e635",
    triggerBg: "rgba(255,255,255,.05)", triggerBorder: "rgba(255,255,255,.1)", triggerColor: "#e8eaf2",
    dropBg: "#0d1424", dropBorder: "rgba(255,255,255,.07)",
    dropHeadBg: "linear-gradient(135deg,#131e35,#0a1020)",
    dropHeadAccent: "#a3e635", dropItemColor: "#b0b8cc",
    dropItemHover: "rgba(163,230,53,.07)",
    logoutColor: "#f87171", logoutHover: "rgba(248,113,113,.1)",
    divider: "rgba(255,255,255,.06)",
    hamburger: "#e8eaf2", mobileBg: "#080d1a",
    searchBg: "rgba(163,230,53,.05)", searchBorder: "rgba(163,230,53,.2)",
  };

  const seekerTheme = {
    nav: "#1a1410", font: "'Outfit', sans-serif",
    navShadow: scrolled ? "0 4px 30px rgba(0,0,0,.5)" : "none",
    navBorder: scrolled ? "rgba(224,123,79,.15)" : "rgba(255,255,255,.04)",
    logoA: "#faf7f2", logoB: "#e07b4f",
    accent: "#e07b4f", accentText: "#fff",
    linkColor: "rgba(250,247,242,.65)", linkHoverColor: "#e07b4f", linkHoverBg: "rgba(224,123,79,.08)",
    pillBg: "rgba(224,123,79,.1)", pillBorder: "rgba(224,123,79,.3)", pillColor: "#e07b4f",
    triggerBg: "rgba(255,255,255,.05)", triggerBorder: "rgba(255,255,255,.1)", triggerColor: "#faf7f2",
    dropBg: "#1e1812", dropBorder: "rgba(255,255,255,.07)",
    dropHeadBg: "linear-gradient(135deg,#261e14,#1a1410)",
    dropHeadAccent: "#e07b4f", dropItemColor: "#b8b0a8",
    dropItemHover: "rgba(224,123,79,.07)",
    logoutColor: "#f87171", logoutHover: "rgba(248,113,113,.1)",
    divider: "rgba(255,255,255,.06)",
    hamburger: "#faf7f2", mobileBg: "#110d09",
    searchBg: "rgba(224,123,79,.05)", searchBorder: "rgba(224,123,79,.2)",
  };

  const adminTheme = {
    nav: "#111827", font: "'DM Sans', sans-serif",
    navShadow: "0 2px 20px rgba(0,0,0,.4)", navBorder: "rgba(255,255,255,.07)",
    logoA: "#fff", logoB: "#818cf8",
    accent: "#818cf8", accentText: "#fff",
    linkColor: "rgba(255,255,255,.65)", linkHoverColor: "#818cf8", linkHoverBg: "rgba(129,140,248,.08)",
    pillBg: "rgba(129,140,248,.1)", pillBorder: "rgba(129,140,248,.3)", pillColor: "#818cf8",
    triggerBg: "rgba(255,255,255,.05)", triggerBorder: "rgba(255,255,255,.1)", triggerColor: "#fff",
    dropBg: "#1f2937", dropBorder: "rgba(255,255,255,.07)",
    dropHeadBg: "linear-gradient(135deg,#1f2937,#111827)",
    dropHeadAccent: "#818cf8", dropItemColor: "#c9d0e0",
    dropItemHover: "rgba(129,140,248,.08)",
    logoutColor: "#f87171", logoutHover: "rgba(248,113,113,.1)",
    divider: "rgba(255,255,255,.07)",
    hamburger: "#fff", mobileBg: "#0f172a",
    searchBg: "transparent", searchBorder: "transparent",
  };

  const t = isAdmin ? adminTheme : isEmployer ? employerTheme : seekerTheme;
  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=Outfit:wght@400;500;600&display=swap');

        .hx-nav {
          position: sticky; top: 0; z-index: 1000;
          background: ${t.nav};
          border-bottom: 1px solid ${t.navBorder};
          box-shadow: ${t.navShadow};
          transition: box-shadow .3s, border-color .3s;
          font-family: ${t.font};
        }
        .hx-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 32px; height: 64px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        /* LOGO */
        .hx-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.75rem; letter-spacing: .06em;
          text-decoration: none; flex-shrink: 0; line-height: 1;
        }
        .hx-la { color: ${t.logoA}; }
        .hx-lb { color: ${t.logoB}; }

        /* LINKS */
        .hx-links {
          display: flex; align-items: center;
          gap: 2px; list-style: none; margin: 0; padding: 0;
        }
        .hx-links a {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 13px; border-radius: 8px;
          font-size: .875rem; font-weight: 500;
          color: ${t.linkColor}; text-decoration: none;
          transition: color .2s, background .2s; white-space: nowrap;
        }
        .hx-links a:hover { color: ${t.linkHoverColor}; background: ${t.linkHoverBg}; }
        .hx-links a.hx-active { color: ${t.accent}; background: ${t.linkHoverBg}; }
        .hx-links a svg { font-size: .75rem; opacity: .6; }

        /* POST PILL */
        .hx-pill {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 16px; border-radius: 999px;
          font-family: ${t.font}; font-size: .85rem; font-weight: 600;
          background: ${t.pillBg}; border: 1px solid ${t.pillBorder};
          color: ${t.pillColor}; text-decoration: none;
          transition: all .2s; flex-shrink: 0;
        }
        .hx-pill:hover { background: ${t.accent}; color: ${t.accentText}; border-color: ${t.accent}; }

        /* SEARCH */
        .hx-search {
          display: flex; align-items: center; gap: 6px;
          background: ${t.searchBg}; border: 1px solid ${t.searchBorder};
          padding: 4px 6px; border-radius: 10px;
        }
        .hx-search select {
          background: transparent; border: none; outline: none;
          color: ${t.linkColor}; font-family: ${t.font};
          font-size: .82rem; padding: 4px 4px; cursor: pointer;
        }
        .hx-search select option { background: ${t.dropBg}; }
        .hx-sbtn {
          background: ${t.accent}; color: ${t.accentText};
          border: none; padding: 6px 12px; border-radius: 6px;
          font-family: ${t.font}; font-size: .82rem; font-weight: 600;
          cursor: pointer; transition: opacity .2s;
        }
        .hx-sbtn:hover { opacity: .85; }

        /* PROFILE */
        .hx-prof { position: relative; }
        .hx-trigger {
          display: flex; align-items: center; gap: 8px;
          background: ${t.triggerBg}; border: 1px solid ${t.triggerBorder};
          padding: 4px 12px 4px 4px; border-radius: 999px;
          cursor: pointer; color: ${t.triggerColor};
          font-family: ${t.font}; font-size: .875rem; font-weight: 500;
          transition: border-color .2s, background .2s;
        }
        .hx-trigger:hover { border-color: ${t.accent}; background: rgba(255,255,255,.03); }
        .hx-av {
          width: 34px; height: 34px; border-radius: 50%;
          object-fit: cover; border: 2px solid ${t.accent}; display: block;
        }
        .hx-uname {
          max-width: 110px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .hx-chev { font-size: 10px; opacity: .5; transition: transform .2s; }
        .hx-chev.open { transform: rotate(180deg); }

        /* DROPDOWN */
        .hx-drop {
          position: absolute; right: 0; top: calc(100% + 10px);
          min-width: 252px; background: ${t.dropBg};
          border: 1px solid ${t.dropBorder}; border-radius: 14px;
          overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.55);
          animation: hxFade .15s ease-out; z-index: 9999;
        }
        @keyframes hxFade {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hx-dhead {
          padding: 16px; background: ${t.dropHeadBg};
          border-bottom: 1px solid ${t.divider};
        }
        .hx-demail { font-size: .82rem; color: ${t.dropItemColor}; margin: 0 0 5px; }
        .hx-drole {
          font-size: .7rem; color: ${t.dropHeadAccent};
          font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
        }
        .hx-dlist { list-style: none; margin: 0; padding: 8px; }
        .hx-dlist li a,
        .hx-dlist li button {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 8px;
          font-family: ${t.font}; font-size: .875rem;
          color: ${t.dropItemColor}; background: transparent;
          border: none; text-decoration: none; cursor: pointer;
          transition: background .15s, color .15s; box-sizing: border-box;
        }
        .hx-dlist li a:hover { background: ${t.dropItemHover}; color: ${t.accent}; }
        .hx-dlist li button { color: ${t.logoutColor} !important; }
        .hx-dlist li button:hover { background: ${t.logoutHover}; }
        .hx-ddiv { height:1px; background:${t.divider}; margin: 4px 0; }

        /* HAMBURGER */
        .hx-burger {
          display: none; background: transparent; border: none;
          color: ${t.hamburger}; font-size: 22px; cursor: pointer; padding: 4px;
        }

        /* MOBILE */
        .hx-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,.65); z-index: 998; backdrop-filter: blur(4px);
        }
        .hx-overlay.open { display: block; }
        .hx-mob {
          position: fixed; top: 0; left: 0; height: 100vh; width: 280px;
          background: ${t.mobileBg}; border-right: 1px solid ${t.divider};
          z-index: 999; display: flex; flex-direction: column;
          padding: 20px; gap: 2px; overflow-y: auto;
          transform: translateX(-100%); transition: transform .28s ease;
        }
        .hx-mob.open { transform: translateX(0); }
        .hx-mob-close {
          align-self: flex-end; background: transparent; border: none;
          color: ${t.linkColor}; font-size: 18px; cursor: pointer; margin-bottom: 12px;
        }
        .hx-mob-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
          letter-spacing: .06em; text-decoration: none; margin-bottom: 20px; display: block;
        }
        .hx-mob a, .hx-mob-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          font-family: ${t.font}; font-size: .9rem; font-weight: 500;
          color: ${t.linkColor}; text-decoration: none;
          background: transparent; border: none; width: 100%;
          cursor: pointer; transition: color .2s, background .2s; box-sizing: border-box;
        }
        .hx-mob a:hover, .hx-mob-btn:hover { color: ${t.accent}; background: ${t.linkHoverBg}; }
        .hx-mob a.hx-active { color: ${t.accent}; background: ${t.linkHoverBg}; }
        .hx-mob-div { height:1px; background:${t.divider}; margin: 8px 0; }
        .hx-mob-out { color: ${t.logoutColor} !important; }
        .hx-mob-out:hover { background: ${t.logoutHover} !important; }

        @media (max-width: 1024px) {
          .hx-links, .hx-search { display: none; }
          .hx-burger { display: flex; align-items: center; justify-content: center; }
          .hx-uname { display: none; }
        }
        @media (max-width: 480px) { .hx-inner { padding: 0 16px; } }
      `}</style>

      {/* NAV */}
      <nav className="hx-nav">
        <div className="hx-inner">
          <Link to="/" className="hx-logo">
            <span className="hx-la">Hand</span><span className="hx-lb">Exa</span>
          </Link>

          {/* desktop links */}
          <ul className="hx-links">
            {!isAdmin && <>
              <li><Link to="/" className={isActive("/") ? "hx-active" : ""}><FaHome />Home</Link></li>
              <li><Link to="/job/getall" className={isActive("/job/getall") ? "hx-active" : ""}><FaBriefcase />Jobs</Link></li>
              <li><Link to="/applications/me" className={isActive("/applications") ? "hx-active" : ""}><FaFileAlt />Applications</Link></li>
              {isEmployer && <li><Link to="/job/me" className={isActive("/job/me") ? "hx-active" : ""}><FaList />My Jobs</Link></li>}
            </>}
            {isAdmin && <li><Link to="/admin/dashboard" className={isActive("/admin") ? "hx-active" : ""}><FaHome />Dashboard</Link></li>}
          </ul>

          {isEmployer && <Link to="/job/post" className="hx-pill"><FaPlus />Post a Job</Link>}

          {isJobSeeker && location.pathname.startsWith("/job") && (
            <form className="hx-search" onSubmit={handleSearch}>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Category</option>
                {categories.map((c, i) => <option key={i}>{c}</option>)}
              </select>
              <select value={county} onChange={e => setCounty(e.target.value)}>
                <option value="">County</option>
                {counties.map((c, i) => <option key={i}>{c}</option>)}
              </select>
              <button type="submit" className="hx-sbtn">Search</button>
            </form>
          )}

          {/* profile */}
          {user && (
            <div className="hx-prof" ref={dropdownRef}>
              <button className="hx-trigger" onClick={() => setShowDropdown(p => !p)}>
                <img src={user.avatar?.url || "/default-profile.png"} className="hx-av" alt="avatar" />
                <span className="hx-uname">{user.name}</span>
                <FaChevronDown className={`hx-chev ${showDropdown ? "open" : ""}`} />
              </button>
              {showDropdown && (
                <div className="hx-drop">
                  <div className="hx-dhead">
                    <p className="hx-demail">{user.email}</p>
                    <span className="hx-drole">{user.role}</span>
                  </div>
                  <ul className="hx-dlist">
                    <li><Link to="/profile" onClick={() => setShowDropdown(false)}><FaUser />Edit Profile</Link></li>
                    <div className="hx-ddiv" />
                    <li><button onClick={handleLogout}><FaSignOutAlt />Logout</button></li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <button className="hx-burger" onClick={() => setShowMenu(true)}><GiHamburgerMenu /></button>
        </div>
      </nav>

      {/* mobile overlay */}
      <div className={`hx-overlay ${showMenu ? "open" : ""}`} onClick={() => setShowMenu(false)} />

      {/* mobile drawer */}
      <div className={`hx-mob ${showMenu ? "open" : ""}`}>
        <button className="hx-mob-close" onClick={() => setShowMenu(false)}><FaTimes /></button>
        <Link to="/" className="hx-mob-logo" onClick={() => setShowMenu(false)}>
          <span className="hx-la">Hand</span><span className="hx-lb">Exa</span>
        </Link>
        {!isAdmin && <>
          <Link to="/" onClick={() => setShowMenu(false)} className={isActive("/") ? "hx-active" : ""}><FaHome />Home</Link>
          <Link to="/job/getall" onClick={() => setShowMenu(false)} className={isActive("/job/getall") ? "hx-active" : ""}><FaBriefcase />Jobs</Link>
          <Link to="/applications/me" onClick={() => setShowMenu(false)} className={isActive("/applications") ? "hx-active" : ""}><FaFileAlt />Applications</Link>
          {isEmployer && <>
            <Link to="/job/post" onClick={() => setShowMenu(false)}><FaPlus />Post a Job</Link>
            <Link to="/job/me" onClick={() => setShowMenu(false)} className={isActive("/job/me") ? "hx-active" : ""}><FaList />My Jobs</Link>
          </>}
        </>}
        {isAdmin && <Link to="/admin/dashboard" onClick={() => setShowMenu(false)}><FaHome />Dashboard</Link>}
        <div className="hx-mob-div" />
        {user && <>
          <Link to="/profile" onClick={() => setShowMenu(false)}><FaUser />Edit Profile</Link>
          <button className="hx-mob-btn hx-mob-out" onClick={() => { setShowMenu(false); handleLogout(); }}>
            <FaSignOutAlt />Logout
          </button>
        </>}
      </div>
    </>
  );
};

export default Navbar;
