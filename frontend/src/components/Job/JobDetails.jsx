import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../main";
import { FaMapMarkerAlt, FaTag, FaCalendarAlt, FaMoneyBillWave, FaArrowLeft } from "react-icons/fa";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();
  const { isAuthorized, user } = useContext(Context);

  const isEmployer = user?.role === "Employer";

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/${id}`, { withCredentials: true })
      .then((res) => { setJob(res.data.job); setLoading(false); })
      .catch(() => navigateTo("/notfound"));
  }, []);

  if (!isAuthorized) { navigateTo("/login"); return null; }

  const t = isEmployer ? {
    bg: "#0a0f1e", cardBg: "#111827", border: "rgba(255,255,255,.07)",
    accent: "#a3e635", accentText: "#0a0f1e", text: "#c9cdd8",
    heading: "#fff", muted: "#6b7280", font: "'DM Sans', sans-serif",
    headingFont: "'Bebas Neue', sans-serif",
    metaBg: "rgba(163,230,53,.06)", metaBorder: "rgba(163,230,53,.15)", metaColor: "#a3e635",
    descBg: "#0d1424", descBorder: "rgba(255,255,255,.05)",
    backColor: "rgba(232,234,242,.5)", backHover: "#a3e635",
    btnBg: "#a3e635", btnColor: "#0a0f1e",
    salaryBig: "#a3e635",
  } : {
    bg: "#faf7f2", cardBg: "#fff", border: "#e8e0d4",
    accent: "#e07b4f", accentText: "#fff", text: "#5a4e47",
    heading: "#1a1410", muted: "#9b8e83", font: "'Outfit', sans-serif",
    headingFont: "'Playfair Display', serif",
    metaBg: "#fdf0e8", metaBorder: "#f5d5c0", metaColor: "#c9602a",
    descBg: "#f5f0ea", descBorder: "#e8e0d4",
    backColor: "#9b8e83", backHover: "#e07b4f",
    btnBg: "#e07b4f", btnColor: "#fff",
    salaryBig: "#e07b4f",
  };

  const salary = job.fixedSalary
    ? `KSh ${Number(job.fixedSalary).toLocaleString()}`
    : job.salaryFrom && job.salaryTo
    ? `KSh ${Number(job.salaryFrom).toLocaleString()} – ${Number(job.salaryTo).toLocaleString()}`
    : "Not specified";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=Outfit:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        .jd-root { background: ${t.bg}; min-height: 100vh; font-family: ${t.font}; }

        .jd-header {
          background: ${isEmployer ? "#0d1424" : "#1a1410"};
          padding: 40px 40px 0;
          border-bottom: 1px solid ${t.border};
        }
        .jd-header-inner { max-width: 900px; margin: 0 auto; }

        .jd-back {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: .85rem; color: ${t.backColor}; text-decoration: none;
          margin-bottom: 28px; transition: color .2s;
        }
        .jd-back:hover { color: ${t.backHover}; }

        .jd-badge {
          display: inline-block;
          background: ${t.metaBg}; color: ${t.metaColor};
          border: 1px solid ${t.metaBorder};
          font-size: 11px; padding: 3px 12px; border-radius: 999px;
          font-weight: 600; margin-bottom: 16px;
        }
        .jd-title {
          font-family: ${t.headingFont};
          font-size: clamp(2rem, 4vw, 3rem);
          color: #fff; margin: 0 0 24px; line-height: 1.1;
        }
        .jd-meta-row {
          display: flex; flex-wrap: wrap; gap: 20px;
          padding-bottom: 32px;
        }
        .jd-meta-item {
          display: flex; align-items: center; gap: 8px;
          font-size: .875rem; color: rgba(255,255,255,.45);
        }
        .jd-meta-item svg { color: ${t.accent}; font-size: .8rem; }

        /* BODY */
        .jd-body { max-width: 900px; margin: 0 auto; padding: 40px; }

        .jd-grid { display: grid; grid-template-columns: 1fr 300px; gap: 28px; }

        /* DESCRIPTION */
        .jd-desc-card {
          background: ${t.descBg}; border: 1px solid ${t.descBorder};
          border-radius: 14px; padding: 32px;
        }
        .jd-section-label {
          font-size: 10px; letter-spacing: .15em; text-transform: uppercase;
          color: ${t.accent}; margin-bottom: 12px;
        }
        .jd-desc-text {
          font-size: .95rem; line-height: 1.8;
          color: ${t.text}; white-space: pre-wrap;
        }

        /* SIDEBAR */
        .jd-sidebar { display: flex; flex-direction: column; gap: 16px; }

        .jd-info-card {
          background: ${t.cardBg}; border: 1.5px solid ${t.border};
          border-radius: 14px; padding: 24px;
        }
        .jd-info-row {
          display: flex; flex-direction: column; gap: 16px;
        }
        .jd-info-item { display: flex; flex-direction: column; gap: 4px; }
        .jd-info-label { font-size: .75rem; color: ${t.muted}; text-transform: uppercase; letter-spacing: .08em; }
        .jd-info-value { font-size: .95rem; color: ${t.heading}; font-weight: 600; }

        /* SALARY BIG */
        .jd-salary-card {
          background: ${isEmployer ? "rgba(163,230,53,.06)" : "#fdf0e8"};
          border: 1.5px solid ${isEmployer ? "rgba(163,230,53,.2)" : "#f5d5c0"};
          border-radius: 14px; padding: 24px; text-align: center;
        }
        .jd-salary-label { font-size: .75rem; color: ${t.muted}; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
        .jd-salary-amount {
          font-family: ${t.headingFont};
          font-size: 1.8rem; color: ${t.salaryBig}; line-height: 1;
        }

        /* APPLY BTN */
        .jd-apply-btn {
          display: block; width: 100%; text-align: center;
          background: ${t.btnBg}; color: ${t.btnColor};
          padding: 14px; border-radius: 10px;
          font-family: ${t.font}; font-size: 1rem; font-weight: 700;
          text-decoration: none; transition: opacity .2s, transform .2s;
        }
        .jd-apply-btn:hover { opacity: .9; transform: translateY(-1px); color: ${t.btnColor}; }

        .jd-employer-note {
          text-align: center; font-size: .82rem;
          color: ${t.muted}; padding: 14px;
          background: ${t.descBg}; border-radius: 10px;
          border: 1px solid ${t.border};
        }

        /* SKELETON */
        .jd-skeleton { background: ${t.cardBg}; border-radius: 14px; height: 400px;
          border: 1px solid ${t.border}; animation: jdShim 1.5s infinite; }
        @keyframes jdShim { 0%,100%{opacity:1} 50%{opacity:.5} }

        @media(max-width:768px) {
          .jd-header { padding: 28px 20px 0; }
          .jd-body { padding: 24px 20px; }
          .jd-grid { grid-template-columns: 1fr; }
          .jd-sidebar { order: -1; }
        }
      `}</style>

      <div className="jd-root">
        <div className="jd-header">
          <div className="jd-header-inner">
            <Link to="/job/getall" className="jd-back"><FaArrowLeft /> Back to all jobs</Link>

            {loading ? (
              <div className="jd-skeleton" />
            ) : (
              <>
                <span className="jd-badge">{job.category}</span>
                <h1 className="jd-title">{job.title}</h1>
                <div className="jd-meta-row">
                  <div className="jd-meta-item"><FaMapMarkerAlt />{job.county}{job.location && ` · ${job.location}`}</div>
                  <div className="jd-meta-item"><FaTag />{job.category}</div>
                  <div className="jd-meta-item">
                    <FaCalendarAlt />
                    {job.jobPostedOn ? new Date(job.jobPostedOn).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "Recently posted"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="jd-body">
          {!loading && (
            <div className="jd-grid">
              {/* DESCRIPTION */}
              <div>
                <div className="jd-desc-card">
                  <p className="jd-section-label">Job Description</p>
                  <p className="jd-desc-text">{job.description || "No description provided."}</p>
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="jd-sidebar">
                <div className="jd-salary-card">
                  <p className="jd-salary-label">Salary</p>
                  <p className="jd-salary-amount">{salary}</p>
                </div>

                <div className="jd-info-card">
                  <div className="jd-info-row">
                    <div className="jd-info-item">
                      <span className="jd-info-label">County</span>
                      <span className="jd-info-value">{job.county || "—"}</span>
                    </div>
                    <div className="jd-info-item">
                      <span className="jd-info-label">Location</span>
                      <span className="jd-info-value">{job.location || "—"}</span>
                    </div>
                    <div className="jd-info-item">
                      <span className="jd-info-label">Category</span>
                      <span className="jd-info-value">{job.category || "—"}</span>
                    </div>
                    <div className="jd-info-item">
                      <span className="jd-info-label">Posted On</span>
                      <span className="jd-info-value">
                        {job.jobPostedOn
                          ? new Date(job.jobPostedOn).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === "Employer" ? (
                  <div className="jd-employer-note">
                    You are viewing this as an employer.
                  </div>
                ) : job._id ? (
                  <Link to={`/application/${job._id}`} className="jd-apply-btn">
                    Apply Now →
                  </Link>
                ) : (
                  <p style={{color: t.muted, fontSize:'.9rem', textAlign:'center'}}>Job not available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetails;
