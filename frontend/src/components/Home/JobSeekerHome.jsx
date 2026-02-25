import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

/* ─────────────────────────────────────────────
   JOB SEEKER HOME  –  "Warm & Aspirational"
   Cream / deep terracotta / earthy gold
   Magazine-editorial layout
───────────────────────────────────────────── */

const tips = [
  { icon: "✦", title: "Complete Your Profile", body: "A complete profile gets 3× more views from employers in your county." },
  { icon: "◈", title: "Upload Your Resume", body: "Stand out with a resume or portfolio — even a photo of your work is enough." },
  { icon: "⬡", title: "Apply Fast", body: "Jobs fill quickly. Set up alerts and be the first to apply in your category." },
];

const categories = [
  { label: "Cleaning & Domestic", color: "#e07b4f" },
  { label: "Chefs & Cooks", color: "#c9a84c" },
  { label: "Carpentry", color: "#7b6a52" },
  { label: "Tailoring", color: "#9b5e6b" },
  { label: "Electrical", color: "#4a7b8c" },
  { label: "Plumbing", color: "#5a7a5e" },
  { label: "Drivers", color: "#7a5e7a" },
  { label: "Gardeners", color: "#5e7a4a" },
  { label: "Photographers", color: "#6a5e8c" },
  { label: "Event Planners", color: "#8c5e4a" },
  { label: "Nail Technicians", color: "#b05e7a" },
  { label: "Make Up Artists", color: "#9b6a5e" },
];

export default function JobSeekerHome() {
  const [recentJobs, setRecentJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("");

  const counties = ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Malindi","Kitale","Garissa","Kakamega"];

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall`, { withCredentials: true })
      .then(({ data }) => setRecentJobs((data.jobs || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        .js-root {
          background: #faf7f2;
          color: #1a1410;
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
        }

        /* ── HERO ── */
        .js-hero {
          background: #1a1410;
          padding: 80px 40px 0;
          position: relative;
          overflow: hidden;
        }
        .js-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 80px;
          background: #faf7f2;
          clip-path: ellipse(55% 100% at 50% 100%);
        }
        .js-hero-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1.2fr 1fr;
          gap: 60px; align-items: end;
          padding-bottom: 80px;
        }
        .js-kicker {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(224,123,79,.15);
          border: 1px solid rgba(224,123,79,.3);
          border-radius: 999px; padding: 4px 14px;
          font-size: 11px; letter-spacing: .12em;
          text-transform: uppercase; color: #e07b4f;
          margin-bottom: 28px;
        }
        .js-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 5vw, 5rem);
          font-weight: 700; line-height: 1.05;
          color: #faf7f2; margin: 0 0 24px;
        }
        .js-h1 em { font-style: italic; color: #e07b4f; }

        .js-sub {
          font-size: 1.05rem; line-height: 1.8;
          color: rgba(250,247,242,.6);
          max-width: 460px; margin-bottom: 0;
        }

        /* search box */
        .js-search-box {
          background: #faf7f2;
          border-radius: 16px; padding: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,.4);
          margin-bottom: 80px;
        }
        .js-search-box h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; color: #1a1410;
          margin: 0 0 20px;
        }
        .js-search-row { display: flex; flex-direction: column; gap: 12px; }
        .js-input {
          border: 1.5px solid #e8e0d4;
          border-radius: 8px; padding: 12px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: .95rem; color: #1a1410;
          background: #fff; outline: none;
          transition: border-color .2s;
          width: 100%; box-sizing: border-box;
        }
        .js-input:focus { border-color: #e07b4f; }
        .js-search-btn {
          background: #e07b4f; color: #fff;
          border: none; border-radius: 8px;
          padding: 13px; font-family: 'Outfit', sans-serif;
          font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: background .2s;
          width: 100%;
        }
        .js-search-btn:hover { background: #c96a3e; }

        /* ── STATS ROW ── */
        .js-stats {
          max-width: 1200px; margin: 60px auto;
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 1px; background: #e8e0d4;
          border-radius: 16px; overflow: hidden;
          padding: 0 40px;
        }
        .js-stat-cell {
          background: #faf7f2; padding: 40px 30px;
          text-align: center;
        }
        .js-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem; color: #e07b4f; font-weight: 700;
        }
        .js-stat-lbl { font-size: .85rem; color: #7a6e63; margin-top: 4px; }

        /* ── FEATURED JOBS ── */
        .js-jobs { padding: 0 40px 80px; max-width: 1200px; margin: 0 auto; }
        .js-section-top {
          display: flex; justify-content: space-between;
          align-items: baseline; margin-bottom: 32px;
        }
        .js-section-label {
          font-size: 11px; letter-spacing: .15em;
          text-transform: uppercase; color: #e07b4f;
          margin-bottom: 8px;
        }
        .js-section-h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem; color: #1a1410;
          margin: 0; line-height: 1.1;
        }
        .js-view-all {
          color: #e07b4f; font-size: .9rem;
          font-weight: 600; text-decoration: none;
          border-bottom: 1px solid #e07b4f;
        }

        .js-jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px,1fr));
          gap: 20px;
        }
        .js-job-card {
          background: #fff;
          border: 1.5px solid #e8e0d4;
          border-radius: 14px; padding: 24px;
          text-decoration: none; color: inherit;
          transition: border-color .25s, transform .2s, box-shadow .25s;
          display: block;
        }
        .js-job-card:hover {
          border-color: #e07b4f;
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(224,123,79,.12);
        }
        .js-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .js-card-badge {
          background: #fdf0e8; color: #c9602a;
          font-size: 11px; padding: 3px 10px;
          border-radius: 999px; font-weight: 600;
        }
        .js-card-type {
          font-size: 11px; color: #9b8e83;
          border: 1px solid #e8e0d4;
          padding: 3px 10px; border-radius: 999px;
        }
        .js-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem; font-weight: 700;
          color: #1a1410; margin: 0 0 6px;
        }
        .js-card-loc { font-size: .85rem; color: #7a6e63; margin: 0 0 16px; }
        .js-card-footer {
          display: flex; justify-content: space-between;
          align-items: center; padding-top: 16px;
          border-top: 1px solid #f0ebe3;
        }
        .js-card-salary { font-weight: 600; color: #1a1410; font-size: .95rem; }
        .js-apply-arrow {
          width: 32px; height: 32px; border-radius: 50%;
          background: #e07b4f; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        /* ── TIPS ── */
        .js-tips { background: #1a1410; padding: 80px 40px; }
        .js-tips-inner { max-width: 1200px; margin: 0 auto; }
        .js-tips-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 48px; }
        .js-tip {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px; padding: 32px;
          transition: border-color .25s;
        }
        .js-tip:hover { border-color: rgba(224,123,79,.4); }
        .js-tip-icon { font-size: 1.8rem; color: #e07b4f; margin-bottom: 16px; }
        .js-tip h3 { color: #faf7f2; font-size: 1.1rem; font-weight: 600; margin: 0 0 10px; }
        .js-tip p { color: rgba(250,247,242,.5); font-size: .9rem; line-height: 1.7; margin: 0; }

        /* ── CATEGORIES ── */
        .js-cats { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }
        .js-cats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-top: 40px; }
        .js-cat-card {
          border-radius: 12px; padding: 20px;
          text-decoration: none; position: relative;
          overflow: hidden; transition: transform .2s;
          display: block; min-height: 90px;
        }
        .js-cat-card:hover { transform: translateY(-3px); }
        .js-cat-card::before {
          content: ''; position: absolute; inset: 0;
          background: var(--cat-color);
          opacity: .12;
        }
        .js-cat-label {
          font-weight: 600; font-size: .95rem;
          color: var(--cat-color); position: relative;
        }
        .js-cat-arrow {
          position: absolute; bottom: 14px; right: 14px;
          color: var(--cat-color); opacity: .5; font-size: 1.2rem;
        }

        /* ── CTA ── */
        .js-cta {
          margin: 0 40px 80px; max-width: 1200px;
          margin-left: auto; margin-right: auto;
          background: linear-gradient(135deg, #e07b4f 0%, #c9602a 100%);
          border-radius: 20px; padding: 70px 80px;
          display: flex; justify-content: space-between;
          align-items: center; gap: 40px;
        }
        .js-cta h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem; color: #fff;
          margin: 0; line-height: 1.1;
        }
        .js-cta h2 em { font-style: italic; }
        .js-cta p { color: rgba(255,255,255,.75); margin: 10px 0 0; font-size: 1rem; }
        .js-cta-btn {
          background: #fff; color: #c9602a;
          padding: 16px 36px; border-radius: 8px;
          font-weight: 700; text-decoration: none;
          white-space: nowrap; font-size: 1rem;
          transition: transform .2s; display: inline-block;
        }
        .js-cta-btn:hover { transform: scale(1.03); color:#c9602a; }

        @media(max-width:900px){
          .js-hero-inner { grid-template-columns: 1fr; }
          .js-stats { grid-template-columns: 1fr 1fr; margin: 40px 24px; padding: 0; }
          .js-tips-grid,.js-cats-grid { grid-template-columns: 1fr 1fr; }
          .js-cta { flex-direction: column; text-align: center; padding: 40px 24px; margin: 0 16px 60px; }
          .js-jobs,.js-cats,.js-tips-inner { padding: 60px 24px; }
        }
        @media(max-width:600px){
          .js-tips-grid,.js-cats-grid { grid-template-columns: 1fr; }
          .js-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="js-root">
        {/* HERO */}
        <section className="js-hero">
          <div className="js-hero-inner">
            <div>
              <div className="js-kicker">🇰🇪 Kenya's #1 Informal Jobs Platform</div>
              <h1 className="js-h1">Your Next <em>Opportunity</em> is Waiting</h1>
              <p className="js-sub">
                Thousands of employers across Kenya are actively hiring.
                Find work that matches your skills — no experience with formal applications needed.
              </p>
            </div>

            <div className="js-search-box">
              <h3>Find Your Next Job</h3>
              <div className="js-search-row">
                <input
                  className="js-input"
                  placeholder="What kind of work? e.g. Carpenter, Chef..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className="js-input"
                  value={county}
                  onChange={e => setCounty(e.target.value)}
                  style={{cursor:'pointer'}}
                >
                  <option value="">Select County</option>
                  {counties.map(c => <option key={c}>{c}</option>)}
                </select>
                <Link
                  to={`/job/getall${search||county ? `?category=${encodeURIComponent(search)}&county=${encodeURIComponent(county)}` : ''}`}
                  className="js-search-btn"
                  style={{display:'block',textAlign:'center',textDecoration:'none'}}
                >
                  Search Jobs →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="js-stats">
          {[
            {n:'5K+',l:'Jobs Available'},
            {n:'12K+',l:'Active Workers'},
            {n:'47',l:'Counties Covered'},
            {n:'Free',l:'Always Free to Apply'},
          ].map(s=>(
            <div className="js-stat-cell" key={s.l}>
              <div className="js-stat-num">{s.n}</div>
              <div className="js-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* RECENT JOBS */}
        <section className="js-jobs">
          <div className="js-section-top">
            <div>
              <p className="js-section-label">Latest Opportunities</p>
              <h2 className="js-section-h2">Fresh Jobs Near You</h2>
            </div>
            <Link to="/job/getall" className="js-view-all">View all jobs</Link>
          </div>

          <div className="js-jobs-grid">
            {recentJobs.length > 0 ? recentJobs.map(job => (
              <Link to={`/job/${job._id}`} className="js-job-card" key={job._id}>
                <div className="js-card-top">
                  <span className="js-card-badge">{job.category}</span>
                  <span className="js-card-type">{job.jobType || 'Full Time'}</span>
                </div>
                <p className="js-card-title">{job.title}</p>
                <p className="js-card-loc">📍 {job.city}, {job.country}</p>
                <div className="js-card-footer">
                  <span className="js-card-salary">
                    KSh {job.fixedSalary?.toLocaleString() || `${job.salaryFrom?.toLocaleString()}–${job.salaryTo?.toLocaleString()}`}
                  </span>
                  <div className="js-apply-arrow">→</div>
                </div>
              </Link>
            )) : (
              <div style={{gridColumn:'1/-1',textAlign:'center',padding:'60px',color:'#7a6e63'}}>
                Loading latest jobs...
              </div>
            )}
          </div>
        </section>

        {/* TIPS */}
        <section className="js-tips">
          <div className="js-tips-inner">
            <p className="js-section-label" style={{color:'#e07b4f'}}>Pro Tips</p>
            <h2 className="js-section-h2" style={{color:'#faf7f2'}}>Stand Out From The Crowd</h2>
            <div className="js-tips-grid">
              {tips.map(t => (
                <div className="js-tip" key={t.title}>
                  <div className="js-tip-icon">{t.icon}</div>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="js-cats">
          <p className="js-section-label">Browse by Category</p>
          <h2 className="js-section-h2">What's Your Skill?</h2>
          <div className="js-cats-grid">
            {categories.map(c => (
              <Link
                to={`/job/getall?category=${encodeURIComponent(c.label)}`}
                className="js-cat-card"
                key={c.label}
                style={{'--cat-color': c.color}}
              >
                <span className="js-cat-label">{c.label}</span>
                <span className="js-cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{padding:'0 40px 80px'}}>
          <div className="js-cta">
            <div>
              <h2>Ready to Find <em>Your Job?</em></h2>
              <p>New jobs are posted every day. Don't miss out — browse now.</p>
            </div>
            <Link to="/job/getall" className="js-cta-btn">Browse All Jobs →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
