import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { Context } from "../../main";
import { useNavigate, Link } from "react-router-dom";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getmyjobs`, { withCredentials: true })
      .then(({ data }) => { setMyJobs(data.myJobs); setLoading(false); })
      .catch(err => { toast.error(err.response?.data?.message || "Failed to load jobs"); setMyJobs([]); setLoading(false); });
  }, []);

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/"); return null;
  }

  const handleEnableEdit = (jobId) => setEditingMode(jobId);
  const handleDisableEdit = () => setEditingMode(null);

  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find(j => j._id === jobId);
    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/update/${jobId}`, updatedJob, { withCredentials: true });
      toast.success(res.data.message);
      setEditingMode(null);
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/delete/${jobId}`, { withCredentials: true });
      toast.success(res.data.message);
      setMyJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
  };

  const handleInputChange = (jobId, field, value) => {
    setMyJobs(prev => prev.map(j => j._id === jobId ? { ...j, [field]: value } : j));
  };

  const categories = ["Cleaning & Domestic Services","Chefs & Cooks","Nannies","Photographers","Househelps","Laundry Services","Construction","Artisans","Gardeners","Electrical & Wiring Services","Tailoring & Fashion Design","Carpentry & Furniture Making","Plumbing & Repairs","Masseuse/Masseur","Event Planners","Nail Technicians","Make Up Artists","Fumigators","Painter","Drivers","Farming & Agriculture","Food Vending & Catering","Other Informal Jobs"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        .mj-root { background: #0a0f1e; min-height: 100vh; font-family: 'DM Sans', sans-serif; color: #e8eaf2; }

        .mj-header {
          background: #0d1424; border-bottom: 1px solid rgba(163,230,53,.1);
          padding: 48px 40px 40px;
        }
        .mj-header-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; }
        .mj-kicker { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #a3e635; margin-bottom: 12px; }
        .mj-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,4vw,3.5rem); color: #fff; margin: 0; line-height: 1; }
        .mj-post-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(163,230,53,.1); border: 1px solid rgba(163,230,53,.3);
          color: #a3e635; padding: 10px 20px; border-radius: 8px;
          text-decoration: none; font-size: .875rem; font-weight: 600;
          transition: all .2s; flex-shrink: 0;
        }
        .mj-post-btn:hover { background: #a3e635; color: #0a0f1e; }

        .mj-body { max-width: 1100px; margin: 0 auto; padding: 40px; }

        /* STATS */
        .mj-stats { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
        .mj-stat {
          background: #111827; border: 1px solid rgba(255,255,255,.07);
          border-radius: 12px; padding: 16px 24px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .mj-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #a3e635; line-height: 1; }
        .mj-stat-lbl { font-size: .75rem; color: #6b7280; }

        /* JOB CARDS */
        .mj-list { display: flex; flex-direction: column; gap: 16px; }

        .mj-card {
          background: #111827; border: 1.5px solid rgba(255,255,255,.07);
          border-radius: 16px; overflow: hidden;
          transition: border-color .25s;
        }
        .mj-card.editing { border-color: rgba(163,230,53,.4); }

        .mj-card-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,.06);
          flex-wrap: wrap; gap: 12px;
        }
        .mj-card-left { display: flex; flex-direction: column; gap: 4px; }
        .mj-card-badge {
          display: inline-block; background: rgba(163,230,53,.08);
          border: 1px solid rgba(163,230,53,.2); color: #a3e635;
          font-size: 10px; padding: 2px 10px; border-radius: 999px;
          font-weight: 600; letter-spacing: .06em;
          width: fit-content; margin-bottom: 4px;
        }
        .mj-expired-badge {
          background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.2); color: #f87171;
        }
        .mj-card-title { font-size: 1.05rem; font-weight: 600; color: #fff; }
        .mj-card-meta { font-size: .82rem; color: #6b7280; }

        /* ACTION BUTTONS */
        .mj-actions { display: flex; gap: 8px; }
        .mj-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 7px; font-size: .82rem;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          cursor: pointer; border: none; transition: all .2s;
        }
        .mj-btn-edit { background: rgba(255,193,7,.1); border: 1px solid rgba(255,193,7,.25); color: #fbbf24; }
        .mj-btn-edit:hover { background: rgba(255,193,7,.2); }
        .mj-btn-save { background: rgba(163,230,53,.1); border: 1px solid rgba(163,230,53,.3); color: #a3e635; }
        .mj-btn-save:hover { background: #a3e635; color: #0a0f1e; }
        .mj-btn-cancel { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); color: #6b7280; }
        .mj-btn-cancel:hover { background: rgba(255,255,255,.08); color: #e8eaf2; }
        .mj-btn-delete { background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2); color: #f87171; }
        .mj-btn-delete:hover { background: rgba(239,68,68,.15); }

        /* EDIT BODY */
        .mj-card-body { padding: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .mj-field { display: flex; flex-direction: column; gap: 6px; }
        .mj-field.full { grid-column: 1/-1; }
        .mj-field-label { font-size: .72rem; color: #6b7280; text-transform: uppercase; letter-spacing: .08em; }
        .mj-field-input, .mj-field-select, .mj-field-textarea {
          background: #0d1424; border: 1.5px solid rgba(255,255,255,.08);
          border-radius: 7px; padding: 9px 12px;
          font-family: 'DM Sans', sans-serif; font-size: .875rem;
          color: #e8eaf2; outline: none; transition: border-color .2s;
          width: 100%; box-sizing: border-box;
        }
        .mj-field-input:focus, .mj-field-select:focus, .mj-field-textarea:focus { border-color: #a3e635; }
        .mj-field-input:disabled, .mj-field-select:disabled { opacity: .4; cursor: default; }
        .mj-field-select option { background: #111827; }
        .mj-field-textarea { resize: vertical; min-height: 80px; }
        .mj-field-textarea:disabled { opacity: .4; }

        /* EMPTY */
        .mj-empty {
          text-align: center; padding: 80px 40px;
          border: 1px dashed rgba(255,255,255,.08); border-radius: 16px;
          color: #6b7280;
        }
        .mj-empty p { font-size: .95rem; margin-bottom: 20px; }

        /* SKELETON */
        .mj-skeleton { height: 100px; background: #111827; border-radius: 16px; border: 1px solid rgba(255,255,255,.06); animation: mjShim 1.5s infinite; }
        @keyframes mjShim { 0%,100%{opacity:1} 50%{opacity:.4} }

        @media(max-width:768px) {
          .mj-header { padding: 32px 20px 28px; }
          .mj-header-inner { flex-direction: column; align-items: flex-start; }
          .mj-body { padding: 24px 20px; }
          .mj-card-body { grid-template-columns: 1fr; }
          .mj-field.full { grid-column: auto; }
        }
      `}</style>

      <div className="mj-root">
        <div className="mj-header">
          <div className="mj-header-inner">
            <div>
              <p className="mj-kicker">Employer Dashboard</p>
              <h1 className="mj-h1">My Posted Jobs</h1>
            </div>
            <Link to="/job/post" className="mj-post-btn">+ Post New Job</Link>
          </div>
        </div>

        <div className="mj-body">
          {/* STATS */}
          {!loading && myJobs.length > 0 && (
            <div className="mj-stats">
              <div className="mj-stat">
                <span className="mj-stat-num">{myJobs.length}</span>
                <span className="mj-stat-lbl">Total Jobs</span>
              </div>
              <div className="mj-stat">
                <span className="mj-stat-num">{myJobs.filter(j => !j.expired).length}</span>
                <span className="mj-stat-lbl">Active</span>
              </div>
              <div className="mj-stat">
                <span className="mj-stat-num">{myJobs.filter(j => j.expired).length}</span>
                <span className="mj-stat-lbl">Expired</span>
              </div>
            </div>
          )}

          <div className="mj-list">
            {loading ? (
              Array(3).fill(0).map((_, i) => <div className="mj-skeleton" key={i} />)
            ) : myJobs.length === 0 ? (
              <div className="mj-empty">
                <p>You haven't posted any jobs yet.</p>
                <Link to="/job/post" className="mj-post-btn">Post Your First Job</Link>
              </div>
            ) : myJobs.map(job => (
              <div className={`mj-card ${editingMode === job._id ? "editing" : ""}`} key={job._id}>
                {/* CARD HEADER */}
                <div className="mj-card-header">
                  <div className="mj-card-left">
                    <span className={`mj-card-badge ${job.expired ? "mj-expired-badge" : ""}`}>
                      {job.expired ? "Expired" : "Active"}
                    </span>
                    <span className="mj-card-title">{job.title}</span>
                    <span className="mj-card-meta">{job.category} · {job.county}</span>
                  </div>
                  <div className="mj-actions">
                    {editingMode === job._id ? (
                      <>
                        <button className="mj-btn mj-btn-save" onClick={() => handleUpdateJob(job._id)}>
                          <FaCheck /> Save
                        </button>
                        <button className="mj-btn mj-btn-cancel" onClick={handleDisableEdit}>
                          <FaTimes /> Cancel
                        </button>
                      </>
                    ) : (
                      <button className="mj-btn mj-btn-edit" onClick={() => handleEnableEdit(job._id)}>
                        <FaEdit /> Edit
                      </button>
                    )}
                    <button className="mj-btn mj-btn-delete" onClick={() => handleDeleteJob(job._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* EDIT BODY — only show when editing */}
                {editingMode === job._id && (
                  <div className="mj-card-body">
                    <div className="mj-field">
                      <label className="mj-field-label">Title</label>
                      <input className="mj-field-input" type="text" value={job.title}
                        onChange={e => handleInputChange(job._id, "title", e.target.value)} />
                    </div>
                    <div className="mj-field">
                      <label className="mj-field-label">Category</label>
                      <select className="mj-field-select" value={job.category}
                        onChange={e => handleInputChange(job._id, "category", e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="mj-field">
                      <label className="mj-field-label">County</label>
                      <input className="mj-field-input" type="text" value={job.county}
                        onChange={e => handleInputChange(job._id, "county", e.target.value)} />
                    </div>
                    <div className="mj-field">
                      <label className="mj-field-label">Location</label>
                      <input className="mj-field-input" type="text" value={job.location || ""}
                        onChange={e => handleInputChange(job._id, "location", e.target.value)} />
                    </div>
                    <div className="mj-field">
                      <label className="mj-field-label">
                        {job.fixedSalary !== undefined && job.fixedSalary !== null && job.fixedSalary !== "" ? "Fixed Salary (KSh)" : "Salary From (KSh)"}
                      </label>
                      {job.fixedSalary !== undefined && job.fixedSalary !== null && job.fixedSalary !== "" ? (
                        <input className="mj-field-input" type="number" value={job.fixedSalary}
                          onChange={e => handleInputChange(job._id, "fixedSalary", e.target.value)} />
                      ) : (
                        <div style={{display:'flex',gap:'8px'}}>
                          <input className="mj-field-input" type="number" placeholder="From" value={job.salaryFrom || ""}
                            onChange={e => handleInputChange(job._id, "salaryFrom", e.target.value)} />
                          <input className="mj-field-input" type="number" placeholder="To" value={job.salaryTo || ""}
                            onChange={e => handleInputChange(job._id, "salaryTo", e.target.value)} />
                        </div>
                      )}
                    </div>
                    <div className="mj-field">
                      <label className="mj-field-label">Status</label>
                      <select className="mj-field-select" value={job.expired}
                        onChange={e => handleInputChange(job._id, "expired", e.target.value === "true")}>
                        <option value={false}>Active</option>
                        <option value={true}>Expired</option>
                      </select>
                    </div>
                    <div className="mj-field full">
                      <label className="mj-field-label">Description</label>
                      <textarea className="mj-field-textarea" rows={4} value={job.description}
                        onChange={e => handleInputChange(job._id, "description", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyJobs;
