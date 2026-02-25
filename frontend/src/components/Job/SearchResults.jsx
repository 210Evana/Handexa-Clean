import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaSearch } from "react-icons/fa";

const SearchResults = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "";
  const county = params.get("county") || "";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/search?category=${category}&county=${county}`)
      .then(res => { setJobs(res.data.jobs || []); setLoading(false); })
      .catch(() => { toast.error("No jobs found for your search."); setJobs([]); setLoading(false); });
  }, [location.search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Outfit:wght@400;500;600&display=swap');

        .sr-root { background: #faf7f2; min-height: 100vh; font-family: 'Outfit', sans-serif; }

        .sr-header {
          background: #1a1410;
          padding: 48px 40px 40px;
          border-bottom: 1px solid rgba(224,123,79,.15);
        }
        .sr-header-inner { max-width: 1100px; margin: 0 auto; }
        .sr-back {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: .85rem; color: rgba(250,247,242,.45);
          text-decoration: none; margin-bottom: 24px; transition: color .2s;
        }
        .sr-back:hover { color: #e07b4f; }
        .sr-kicker { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #e07b4f; margin-bottom: 12px; }
        .sr-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem,4vw,3rem); color: #fff; margin: 0 0 8px; line-height: 1.1;
        }
        .sr-sub { font-size: .9rem; color: rgba(250,247,242,.4); margin: 0; }

        .sr-chips { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
        .sr-chip {
          background: rgba(224,123,79,.12); border: 1px solid rgba(224,123,79,.25);
          color: #e07b4f; padding: 4px 14px; border-radius: 999px;
          font-size: .8rem; font-weight: 600;
        }

        .sr-body { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .sr-count { font-size: .875rem; color: #9b8e83; margin-bottom: 24px; }
        .sr-count strong { color: #e07b4f; }

        .sr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px,1fr));
          gap: 20px;
        }
        .sr-card {
          background: #fff; border: 1.5px solid #e8e0d4;
          border-radius: 14px; padding: 24px;
          text-decoration: none; color: inherit; display: block;
          transition: border-color .25s, transform .2s, box-shadow .25s;
        }
        .sr-card:hover {
          border-color: #e07b4f; transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(224,123,79,.1);
        }
        .sr-badge {
          display: inline-block; background: #fdf0e8; color: #c9602a;
          border: 1px solid #f5d5c0; font-size: 11px;
          padding: 3px 10px; border-radius: 999px; font-weight: 600;
          margin-bottom: 12px;
        }
        .sr-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; color: #1a1410; margin: 0 0 6px;
        }
        .sr-loc { font-size: .82rem; color: #9b8e83; margin: 0 0 auto; }
        .sr-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 18px; padding-top: 14px; border-top: 1px solid #f0ebe3;
        }
        .sr-salary { font-weight: 700; color: #1a1410; font-size: .95rem; }
        .sr-arrow {
          width: 30px; height: 30px; border-radius: 50%;
          background: #e07b4f; color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 13px;
        }

        /* EMPTY */
        .sr-empty {
          grid-column: 1/-1; text-align: center; padding: 80px 40px;
          border: 1px dashed #e8e0d4; border-radius: 16px;
        }
        .sr-empty-icon { font-size: 2.5rem; color: #e8e0d4; margin-bottom: 16px; }
        .sr-empty p { font-size: .95rem; color: #9b8e83; margin-bottom: 20px; }
        .sr-empty-btn {
          display: inline-block; background: #e07b4f; color: #fff;
          padding: 10px 24px; border-radius: 8px; text-decoration: none;
          font-weight: 600; font-size: .9rem;
        }

        /* SKELETON */
        .sr-skeleton { background: #fff; border: 1.5px solid #e8e0d4; border-radius: 14px; height: 160px; position: relative; overflow: hidden; }
        .sr-skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg,transparent,rgba(224,123,79,.04),transparent); animation: srShim 1.5s infinite; }
        @keyframes srShim { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

        @media(max-width:768px) {
          .sr-header { padding: 32px 20px 28px; }
          .sr-body { padding: 24px 20px; }
          .sr-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sr-root">
        <div className="sr-header">
          <div className="sr-header-inner">
            <Link to="/job/getall" className="sr-back"><FaArrowLeft /> Back to all jobs</Link>
            <p className="sr-kicker">Search Results</p>
            <h1 className="sr-h1">
              {category || county
                ? `Jobs${category ? ` in "${category}"` : ""}${county ? ` · ${county}` : ""}`
                : "All Jobs"}
            </h1>
            <p className="sr-sub">Showing results for your search</p>
            <div className="sr-chips">
              {category && <span className="sr-chip">📂 {category}</span>}
              {county && <span className="sr-chip">📍 {county}</span>}
            </div>
          </div>
        </div>

        <div className="sr-body">
          <p className="sr-count">Found <strong>{jobs.length}</strong> {jobs.length === 1 ? "job" : "jobs"}</p>

          <div className="sr-grid">
            {loading ? (
              Array(6).fill(0).map((_, i) => <div className="sr-skeleton" key={i} />)
            ) : jobs.length === 0 ? (
              <div className="sr-empty">
                <div className="sr-empty-icon"><FaSearch /></div>
                <p>No jobs matched your search. Try a different category or county.</p>
                <Link to="/job/getall" className="sr-empty-btn">Browse All Jobs</Link>
              </div>
            ) : jobs.map(job => (
              <Link to={`/job/${job._id}`} className="sr-card" key={job._id}>
                <span className="sr-badge">{job.category}</span>
                <p className="sr-title">{job.title}</p>
                <p className="sr-loc">📍 {job.county}</p>
                <div className="sr-footer">
                  <span className="sr-salary">
                    KSh {job.fixedSalary?.toLocaleString()
                      || `${job.salaryFrom?.toLocaleString()}–${job.salaryTo?.toLocaleString()}`}
                  </span>
                  <div className="sr-arrow">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResults;
