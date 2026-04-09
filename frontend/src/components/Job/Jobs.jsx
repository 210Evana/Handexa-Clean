import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import "./Jobs.css";

const Jobs = () => {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("All");

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const isEmployer = user?.role === "Employer";
  const roleClass  = isEmployer ? "employer" : "seeker";

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`, {
        withCredentials: true,
      })
      .then((res) => { setJobs(res.data.jobs); setLoading(false); })
      .catch(() => navigateTo("/notfound"));
  }, []);

  if (!isAuthorized) { navigateTo("/login"); return null; }

  const categories = [...new Set(jobs.map((j) => j.category))];
  const filtered   = filter === "All" ? jobs : jobs.filter((j) => j.category === filter);

  const formatSalary = (job) => {
    if (job.fixedSalary) return `KSh ${job.fixedSalary.toLocaleString()}`;
    if (job.salaryFrom && job.salaryTo)
      return `KSh ${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()}`;
    return "Negotiable";
  };

  return (
    <div className={`jl-root ${roleClass}`}>

      {/* ── HERO ── */}
      <div className="jl-hero">
        <div className="jl-hero-inner">
          <p className="jl-kicker">Kenya · {filtered.length} Opportunities Available</p>
          <h1 className="jl-h1">All Available Jobs</h1>
          <p className="jl-sub">Browse opportunities across Kenya's informal job market</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="jl-body">

        {/* Filter pills */}
        <div className="jl-filters">
          <button
            className={`jl-pill ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`jl-pill ${filter === c ? "active" : ""}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="jl-count">
          Showing <strong>{filtered.length}</strong> of {jobs.length} jobs
          {filter !== "All" && ` in "${filter}"`}
        </p>

        {/* Grid */}
        <div className="jl-grid">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div className="jl-skeleton" key={i} />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((job) => (
              <Link to={`/job/${job._id}`} className="jl-card" key={job._id}>
                <div className="jl-card-top">
                  <span className="jl-badge">{job.category}</span>
                </div>
                <p className="jl-card-title">{job.title}</p>
                <p className="jl-card-loc">📍 {job.county}</p>
                <div className="jl-card-footer">
                  <span className="jl-salary">{formatSalary(job)}</span>
                  <span className="jl-apply">&#8594;</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="jl-empty">
              <p style={{ fontSize: "1rem" }}>No jobs found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
