import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const isEmployer = user?.role === "Employer";

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`, { withCredentials: true })
      .then((res) => { setJobs(res.data.jobs); setLoading(false); })
      .catch(() => { navigateTo("/notfound"); });
  }, []);

  if (!isAuthorized) { navigateTo("/login"); return null; }

  const categories = [...new Set(jobs.map(j => j.category))];
  const filtered = filter === "All" ? jobs : jobs.filter(j => j.category === filter);

  // theme based on role
  const t = isEmployer ? {
    bg: "#0a0f1e", cardBg: "#111827", border: "rgba(255,255,255,.07)",
    accent: "#a3e635", accentText: "#0a0f1e", text: "#e8eaf2",
    muted: "#6b7280", badge: "rgba(163,230,53,.1)", badgeText: "#a3e635",
    badgeBorder: "rgba(163,230,53,.2)", pillActive: "#a3e635", pillActiveTxt: "#0a0f1e",
    pillBg: "rgba(255,255,255,.04)", pillBorder: "rgba(255,255,255,.08)", pillTxt: "#6b7280",
    heading: "#fff", font: "'DM Sans', sans-serif", headingFont: "'Bebas Neue', sans-serif",
    hover: "rgba(163,230,53,.05)", hoverBorder: "rgba(163,230,53,.3)",
    salaryColor: "#a3e635", linkBg: "rgba(163,230,53,.1)", linkColor: "#a3e635",
  } : {
    bg: "#faf7f2", cardBg: "#fff", border: "#e8e0d4",
    accent: "#e07b4f", accentText: "#fff", text: "#3d3530",
    muted: "#9b8e83", badge: "#fdf0e8", badgeText: "#c9602a",
    badgeBorder: "#f5d5c0", pillActive: "#e07b4f", pillActiveTxt: "#fff",
    pillBg: "#f5f0ea", pillBorder: "#e8e0d4", pillTxt: "#7a6e63",
    heading: "#1a1410", font: "'Outfit', sans-serif", headingFont: "'Playfair Display', serif",
    hover: "rgba(224,123,79,.03)", hoverBorder: "#e07b4f",
    salaryColor: "#1a1410", linkBg: "#e07b4f", linkColor: "#fff",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=Outfit:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        .jl-root { background: ${t.bg}; min-height: 100vh; font-family: ${t.font}; }

        .jl-hero {
          background: ${isEmployer ? "linear-gradient(135deg,#0d1424 0%,#0a0f1e 100%)" : "#1a1410"};
          padding: 60px 40px 50px;
          border-bottom: 1px solid ${isEmployer ? "rgba(163,230,53,.1)" : "rgba(224,123,79,.15)"};
        }
        .jl-hero-inner { max-width: 1200px; margin: 0 auto; }
        .jl-kicker {
          font-size: 11px; letter-spacing: .15em; text-transform: uppercase;
          color: ${t.accent}; margin-bottom: 12px;
        }
        .jl-h1 {
          font-family: ${t.headingFont};
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          color: #fff; margin: 0 0 10px; line-height: 1.1;
        }
        .jl-sub { font-size: .95rem; color: rgba(255,255,255,.45); margin: 0; }

        .jl-body { max-width: 1200px; margin: 0 auto; padding: 40px; }

        /* FILTER PILLS */
        .jl-filters {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;
        }
        .jl-pill {
          padding: 6px 16px; border-radius: 999px; font-size: .82rem;
          font-weight: 500; cursor: pointer; font-family: ${t.font};
          border: 1px solid ${t.pillBorder}; background: ${t.pillBg};
          color: ${t.pillTxt}; transition: all .2s;
        }
        .jl-pill:hover { border-color: ${t.accent}; color: ${t.accent}; }
        .jl-pill.active {
          background: ${t.pillActive}; color: ${t.pillActiveTxt};
          border-color: ${t.pillActive};
        }

        /* COUNT */
        .jl-count { font-size: .85rem; color: ${t.muted}; margin-bottom: 24px; }
        .jl-count strong { color: ${t.accent}; }

        /* GRID */
        .jl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px,1fr));
          gap: 20px;
        }
        .jl-card {
          background: ${t.cardBg};
          border: 1.5px solid ${t.border};
          border-radius: 14px; padding: 24px;
          display: flex; flex-direction: column;
          transition: border-color .25s, transform .2s, box-shadow .25s;
          text-decoration: none;
        }
        .jl-card:hover {
          border-color: ${t.hoverBorder};
          transform: translateY(-3px);
          box-shadow: 0 12px 40px ${isEmployer ? "rgba(163,230,53,.08)" : "rgba(224,123,79,.1)"};
          background: ${t.hover};
        }
        .jl-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .jl-badge {
          background: ${t.badge}; color: ${t.badgeText};
          font-size: 11px; padding: 3px 10px; border-radius: 999px;
          font-weight: 600; border: 1px solid ${t.badgeBorder};
        }
        .jl-card-title {
          font-family: ${t.headingFont};
          font-size: 1.1rem; font-weight: 700;
          color: ${t.heading}; margin: 0 0 6px;
        }
        .jl-card-loc { font-size: .82rem; color: ${t.muted}; margin: 0 0 auto; }
        .jl-card-footer {
          display: flex; justify-content: space-between;
          align-items: center; margin-top: 20px;
          padding-top: 16px; border-top: 1px solid ${t.border};
        }
        .jl-salary { font-weight: 700; color: ${t.salaryColor}; font-size: .95rem; }
        .jl-apply {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: ${t.linkBg}; color: ${t.linkColor};
          font-size: 14px; text-decoration: none;
          transition: transform .2s;
        }
        .jl-apply:hover { transform: scale(1.1); }

        /* LOADING / EMPTY */
        .jl-empty {
          grid-column: 1/-1; text-align: center;
          padding: 80px 40px; color: ${t.muted};
        }
        .jl-skeleton {
          background: ${t.cardBg}; border: 1.5px solid ${t.border};
          border-radius: 14px; padding: 24px; height: 180px;
          position: relative; overflow: hidden;
        }
        .jl-skeleton::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.04) 50%, transparent 100%);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        @media(max-width:768px) {
          .jl-hero { padding: 40px 20px 36px; }
          .jl-body { padding: 24px 20px; }
          .jl-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="jl-root">
        <div className="jl-hero">
          <div className="jl-hero-inner">
            <p className="jl-kicker">🇰🇪 {filtered.length} Opportunities Available</p>
            <h1 className="jl-h1">All Available Jobs</h1>
            <p className="jl-sub">Browse opportunities across Kenya's informal job market</p>
          </div>
        </div>

        <div className="jl-body">
          {/* FILTERS */}
          <div className="jl-filters">
            <button
              className={`jl-pill ${filter === "All" ? "active" : ""}`}
              onClick={() => setFilter("All")}
            >All Categories</button>
            {categories.map(c => (
              <button
                key={c}
                className={`jl-pill ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >{c}</button>
            ))}
          </div>

          <p className="jl-count">
            Showing <strong>{filtered.length}</strong> of {jobs.length} jobs
            {filter !== "All" && ` in "${filter}"`}
          </p>

          <div className="jl-grid">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div className="jl-skeleton" key={i} />)
            ) : filtered.length > 0 ? (
              filtered.map(job => (
                <Link to={`/job/${job._id}`} className="jl-card" key={job._id}>
                  <div className="jl-card-top">
                    <span className="jl-badge">{job.category}</span>
                  </div>
                  <p className="jl-card-title">{job.title}</p>
                  <p className="jl-card-loc">📍 {job.county}</p>
                  <div className="jl-card-footer">
                    <span className="jl-salary">
                      KSh {job.fixedSalary?.toLocaleString()
                        || `${job.salaryFrom?.toLocaleString()}–${job.salaryTo?.toLocaleString()}`}
                    </span>
                    <span className="jl-apply">→</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="jl-empty">
                <p style={{fontSize:'1rem'}}>No jobs found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Jobs;
