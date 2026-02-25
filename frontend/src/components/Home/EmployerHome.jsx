import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

/* ─────────────────────────────────────────────
   EMPLOYER HOME  –  "Command Centre" aesthetic
   Dark navy / electric-lime / sharp geometry
───────────────────────────────────────────── */

const stats = [
  { value: "12K+", label: "Active Workers" },
  { value: "3.2K+", label: "Jobs Posted" },
  { value: "94%", label: "Fill Rate" },
  { value: "48h", label: "Avg. Hire Time" },
];

const steps = [
  {
    n: "01",
    title: "Post in 2 Minutes",
    body: "Describe the role, set your budget, choose your county. No forms, no fluff.",
  },
  {
    n: "02",
    title: "Review Applicants",
    body: "Receive pitches & resumes directly. Filter by skill, location, or rating.",
  },
  {
    n: "03",
    title: "Hire with Confidence",
    body: "Chat, verify, and confirm — all inside Handexa. No middlemen.",
  },
];

const categories = [
  "Cleaning & Domestic","Carpentry","Electrical","Plumbing",
  "Tailoring","Drivers","Gardeners","Event Planners",
  "Chefs & Cooks","Painters","Fumigators","Nail Technicians",
];

export default function EmployerHome() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/me`, { withCredentials: true })
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        .eh-root {
          background: #0a0f1e;
          color: #e8eaf2;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* ── HERO ── */
        .eh-hero {
          position: relative;
          overflow: hidden;
          padding: 100px 40px 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
        }
        .eh-hero::before {
          content: '';
          position: absolute;
          top: -200px; right: -200px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(163,230,53,.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .eh-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(163,230,53,.1);
          border: 1px solid rgba(163,230,53,.3);
          border-radius: 999px;
          padding: 4px 14px;
          font-size: 12px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #a3e635;
          margin-bottom: 24px;
        }
        .eh-eyebrow span { width:6px;height:6px;border-radius:50%;background:#a3e635;display:inline-block;animation:pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

        .eh-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 6vw, 6rem);
          line-height: .95;
          letter-spacing: .02em;
          margin: 0 0 24px;
          color: #fff;
        }
        .eh-h1 em { font-style: normal; color: #a3e635; }

        .eh-sub {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #8892aa;
          max-width: 480px;
          margin-bottom: 40px;
        }

        .eh-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .eh-btn-primary {
          background: #a3e635;
          color: #0a0f1e;
          padding: 14px 32px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          transition: transform .2s, box-shadow .2s;
          display: inline-block;
        }
        .eh-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(163,230,53,.35); color:#0a0f1e; }
        .eh-btn-ghost {
          border: 1px solid rgba(255,255,255,.2);
          color: #e8eaf2;
          padding: 14px 32px;
          border-radius: 6px;
          font-size: 1rem;
          text-decoration: none;
          transition: border-color .2s, background .2s;
          display: inline-block;
        }
        .eh-btn-ghost:hover { border-color: #a3e635; background: rgba(163,230,53,.06); color:#e8eaf2; }

        /* ── STATS CARD ── */
        .eh-stats-card {
          background: #111827;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          overflow: hidden;
          position: relative;
        }
        .eh-stats-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(163,230,53,.05) 0%, transparent 60%);
        }
        .eh-stat {
          padding: 28px;
          position: relative;
        }
        .eh-stat:nth-child(1),.eh-stat:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,.06); }
        .eh-stat:nth-child(1),.eh-stat:nth-child(3) { border-right: 1px solid rgba(255,255,255,.06); }
        .eh-stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          color: #a3e635;
          line-height: 1;
        }
        .eh-stat-label { font-size: .85rem; color: #6b7280; margin-top: 4px; }

        /* ── DIVIDER ── */
        .eh-divider {
          max-width: 1280px; margin: 0 auto;
          height: 1px; background: rgba(255,255,255,.06);
        }

        /* ── HOW IT WORKS ── */
        .eh-how { padding: 80px 40px; max-width: 1280px; margin: 0 auto; }
        .eh-section-label {
          font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
          color: #a3e635; margin-bottom: 16px;
        }
        .eh-section-h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          color: #fff; margin: 0 0 60px; line-height: 1;
        }
        .eh-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; }
        .eh-step {
          background: #111827;
          border: 1px solid rgba(255,255,255,.06);
          padding: 40px 32px;
          border-radius: 12px;
          position: relative;
          transition: border-color .3s;
        }
        .eh-step:hover { border-color: rgba(163,230,53,.4); }
        .eh-step-n {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 4rem; color: rgba(163,230,53,.15);
          line-height: 1; margin-bottom: 20px;
        }
        .eh-step h3 { font-size: 1.2rem; font-weight: 600; color: #fff; margin: 0 0 12px; }
        .eh-step p { font-size: .95rem; color: #6b7280; line-height: 1.7; margin: 0; }

        /* ── MY JOBS ── */
        .eh-jobs { padding: 80px 40px; max-width: 1280px; margin: 0 auto; }
        .eh-jobs-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .eh-jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 16px; }
        .eh-job-card {
          background: #111827;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 12px; padding: 24px;
          transition: border-color .3s, transform .2s;
        }
        .eh-job-card:hover { border-color: rgba(163,230,53,.3); transform: translateY(-2px); }
        .eh-job-tag {
          display: inline-block;
          background: rgba(163,230,53,.1);
          color: #a3e635; font-size: 11px;
          padding: 2px 10px; border-radius: 999px;
          text-transform: uppercase; letter-spacing: .08em;
          margin-bottom: 12px;
        }
        .eh-job-title { font-weight: 600; color: #fff; font-size: 1.05rem; margin: 0 0 6px; }
        .eh-job-meta { font-size: .85rem; color: #6b7280; margin: 0 0 16px; }
        .eh-job-footer { display: flex; justify-content: space-between; align-items: center; }
        .eh-job-salary { font-size: .9rem; color: #a3e635; font-weight: 600; }
        .eh-job-apps { font-size: .8rem; color: #6b7280; }

        .eh-empty {
          grid-column: 1/-1;
          text-align: center; padding: 60px;
          border: 1px dashed rgba(255,255,255,.1);
          border-radius: 12px;
        }
        .eh-empty p { color: #6b7280; margin-bottom: 20px; }

        /* ── CATEGORIES ── */
        .eh-cats { padding: 80px 40px; background: #060b18; }
        .eh-cats-inner { max-width: 1280px; margin: 0 auto; }
        .eh-cats-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 40px; }
        .eh-cat-pill {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          color: #8892aa; padding: 8px 20px;
          border-radius: 999px; font-size: .9rem;
          cursor: pointer; transition: all .2s;
        }
        .eh-cat-pill:hover { background: rgba(163,230,53,.1); border-color: rgba(163,230,53,.3); color: #a3e635; }

        /* ── CTA BANNER ── */
        .eh-cta {
          margin: 0 40px 80px;
          max-width: 1200px;
          margin-left: auto; margin-right: auto;
          background: linear-gradient(135deg, #a3e635 0%, #65a30d 100%);
          border-radius: 20px;
          padding: 60px 80px;
          display: flex; justify-content: space-between; align-items: center;
          gap: 40px;
        }
        .eh-cta h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem; color: #0a0f1e;
          margin: 0; line-height: 1;
        }
        .eh-cta p { color: rgba(10,15,30,.7); margin: 8px 0 0; font-size: 1rem; }
        .eh-cta-btn {
          background: #0a0f1e; color: #a3e635;
          padding: 16px 36px; border-radius: 8px;
          font-weight: 700; text-decoration: none;
          white-space: nowrap; font-size: 1rem;
          transition: transform .2s;
          display: inline-block;
        }
        .eh-cta-btn:hover { transform: scale(1.03); color:#a3e635; }

        @media(max-width:900px){
          .eh-hero { grid-template-columns: 1fr; padding: 60px 24px; }
          .eh-stats-card { display: none; }
          .eh-steps { grid-template-columns: 1fr; }
          .eh-cta { flex-direction: column; text-align: center; padding: 40px 24px; margin: 0 16px 60px; }
          .eh-how,.eh-jobs,.eh-cats-inner { padding: 60px 24px; }
        }
      `}</style>

      <div className="eh-root">
        {/* HERO */}
        <section className="eh-hero">
          <div>
            <div className="eh-eyebrow"><span />Kenya's Informal Workforce Platform</div>
            <h1 className="eh-h1">Hire the <em>Right Hands</em> in Hours</h1>
            <p className="eh-sub">
              Post a job in under 2 minutes. Get matched with verified artisans,
              domestic workers, and skilled professionals across all 47 counties.
            </p>
            <div className="eh-actions">
              <Link to="/job/post" className="eh-btn-primary">Post a Job Now</Link>
              <Link to="/job/me" className="eh-btn-ghost">View My Jobs</Link>
            </div>
          </div>

          <div className="eh-stats-card">
            {stats.map(s => (
              <div className="eh-stat" key={s.label}>
                <div className="eh-stat-val">{s.value}</div>
                <div className="eh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="eh-divider" />

        {/* HOW IT WORKS */}
        <section className="eh-how">
          <p className="eh-section-label">Process</p>
          <h2 className="eh-section-h2">Three Steps to Your Next Hire</h2>
          <div className="eh-steps">
            {steps.map(s => (
              <div className="eh-step" key={s.n}>
                <div className="eh-step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="eh-divider" />

        {/* MY ACTIVE JOBS */}
        <section className="eh-jobs">
          <div className="eh-jobs-header">
            <div>
              <p className="eh-section-label">Dashboard</p>
              <h2 className="eh-section-h2" style={{marginBottom:0}}>Your Active Jobs</h2>
            </div>
            <Link to="/job/post" className="eh-btn-primary">+ Post New</Link>
          </div>

          <div className="eh-jobs-grid">
            {jobs.length > 0 ? jobs.slice(0,6).map(job => (
              <div className="eh-job-card" key={job._id}>
                <span className="eh-job-tag">{job.category}</span>
                <p className="eh-job-title">{job.title}</p>
                <p className="eh-job-meta">{job.city}, {job.country}</p>
                <div className="eh-job-footer">
                  <span className="eh-job-salary">
                    KSh {job.fixedSalary?.toLocaleString() || `${job.salaryFrom?.toLocaleString()}–${job.salaryTo?.toLocaleString()}`}
                  </span>
                  <span className="eh-job-apps">{job.applications?.length || 0} applicants</span>
                </div>
              </div>
            )) : (
              <div className="eh-empty">
                <p>No active jobs yet. Post your first one!</p>
                <Link to="/job/post" className="eh-btn-primary">Post a Job</Link>
              </div>
            )}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="eh-cats">
          <div className="eh-cats-inner">
            <p className="eh-section-label">Browse By Category</p>
            <h2 className="eh-section-h2">What kind of work do you need?</h2>
            <div className="eh-cats-grid">
              {categories.map(c => <div className="eh-cat-pill" key={c}>{c}</div>)}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <div style={{padding:'80px 40px'}}>
          <div className="eh-cta">
            <div>
              <h2>Ready to Scale Your Hiring?</h2>
              <p>Join 3,000+ employers who found their best workers on Handexa.</p>
            </div>
            <Link to="/job/post" className="eh-cta-btn">Post a Job →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
