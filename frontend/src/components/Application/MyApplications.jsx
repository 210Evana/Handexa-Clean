import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaComment, FaTrash, FaImage, FaTimes } from "react-icons/fa";
import "./MyApplications.css";

/* ─── RESUME MODAL ─── */
const ResumeModal = ({ imageUrl, onClose }) => (
  <div className="ma-modal-overlay" onClick={onClose}>
    <div className="ma-modal-box" onClick={e => e.stopPropagation()}>
      <button className="ma-modal-close" onClick={onClose}><FaTimes /></button>
      <img src={imageUrl} alt="resume" className="ma-modal-img" />
    </div>
  </div>
);

/* ─── STATUS BADGE ─── */
const StatusBadge = ({ status }) => (
  <span className={`ma-badge ${status || "pending"}`}>
    {status || "Pending"}
  </span>
);

/* ─── JOB SEEKER CARD ─── */
const JobSeekerCard = ({ element, deleteApplication, openModal, navigateTo }) => (
  <div className="ma-card">
    <div className="ma-card-head">
      <div className="ma-card-left">
        <StatusBadge status={element.status} />
        <p className="ma-job-title">{element.jobId?.title || "Unknown Job"}</p>
        <p className="ma-job-loc">📍 {element.jobId?.location || element.jobId?.county || "—"}</p>
      </div>
    </div>

    <div className="ma-card-body">
      <div className="ma-details">
        <div className="ma-detail-item">
          <span className="ma-detail-label">Name</span>
          <span className="ma-detail-value">{element.name}</span>
        </div>
        <div className="ma-detail-item">
          <span className="ma-detail-label">Phone</span>
          <span className="ma-detail-value">{element.phone}</span>
        </div>
        <div className="ma-detail-item">
          <span className="ma-detail-label">Email</span>
          <span className="ma-detail-value">{element.email}</span>
        </div>
        <div className="ma-detail-item">
          <span className="ma-detail-label">Address</span>
          <span className="ma-detail-value">{element.address}</span>
        </div>
        {element.coverLetter && (
          <div className="ma-detail-item full">
            <span className="ma-detail-label">Your Pitch</span>
            <span className="ma-detail-value cover">{element.coverLetter}</span>
          </div>
        )}
      </div>

      <div className="ma-resume-col">
        {element.resume?.url ? (
          <>
            <img src={element.resume.url} alt="document"
              className="ma-resume-thumb"
              onClick={() => openModal(element.resume.url)} />
            <span className="ma-resume-hint">Click to view</span>
          </>
        ) : (
          <div className="ma-no-resume">
            <FaImage />
            <span>No document</span>
          </div>
        )}
      </div>
    </div>

    <div className="ma-card-foot">
      <div className="ma-actions">
        <button className="ma-btn ma-btn-msg" onClick={() => navigateTo(`/message/${element._id}`)}>
          <FaComment /> Message
        </button>
        <button className="ma-btn ma-btn-del" onClick={() => deleteApplication(element._id)}>
          <FaTrash /> Withdraw
        </button>
      </div>
    </div>
  </div>
);

/* ─── EMPLOYER CARD ─── */
const EmployerCard = ({ element, openModal, handleStatusChange, navigateTo }) => (
  <div className="ma-card">
    <div className="ma-card-head">
      <div className="ma-card-left">
        <StatusBadge status={element.status} />
        <p className="ma-job-title">{element.jobId?.title || "Unknown Job"}</p>
        <p className="ma-job-loc">📍 {element.jobId?.location || element.jobId?.county || "—"}</p>
      </div>
    </div>

    <div className="ma-card-body">
      <div className="ma-details">
        <div className="ma-detail-item">
          <span className="ma-detail-label">Applicant</span>
          <span className="ma-detail-value">{element.name}</span>
        </div>
        <div className="ma-detail-item">
          <span className="ma-detail-label">Phone</span>
          <span className="ma-detail-value">{element.phone}</span>
        </div>
        <div className="ma-detail-item">
          <span className="ma-detail-label">Email</span>
          <span className="ma-detail-value">{element.email}</span>
        </div>
        <div className="ma-detail-item">
          <span className="ma-detail-label">Address</span>
          <span className="ma-detail-value">{element.address}</span>
        </div>
        {element.coverLetter && (
          <div className="ma-detail-item full">
            <span className="ma-detail-label">Their Pitch</span>
            <span className="ma-detail-value cover">{element.coverLetter}</span>
          </div>
        )}
      </div>

      <div className="ma-resume-col">
        {element.resume?.url ? (
          <>
            <img src={element.resume.url} alt="document"
              className="ma-resume-thumb"
              onClick={() => openModal(element.resume.url)} />
            <span className="ma-resume-hint">Click to view</span>
          </>
        ) : (
          <div className="ma-no-resume">
            <FaImage />
            <span>No document</span>
          </div>
        )}
      </div>
    </div>

    <div className="ma-card-foot">
      <select
        className="ma-status-select"
        value={element.status || "pending"}
        onChange={e => handleStatusChange(element._id, e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="accepted">Accept Applicant</option>
        <option value="rejected">Reject Applicant</option>
      </select>
      <div className="ma-actions">
        <button className="ma-btn ma-btn-msg" onClick={() => navigateTo(`/message/${element._id}`)}>
          <FaComment /> Message
        </button>
      </div>
    </div>
  </div>
);

/* ─── MAIN COMPONENT ─── */
const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState(null);
  const navigateTo = useNavigate();

  const isEmployer = user?.role === "Employer";

  useEffect(() => {
    if (!isAuthorized || !user) return;
    const endpoint = isEmployer
      ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/employer/getall`
      : `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/jobseeker/getall`;

    axios.get(endpoint, { withCredentials: true })
      .then(({ data }) => { setApplications(data.applications || []); setLoading(false); })
      .catch(err => { toast.error(err.response?.data?.message || "Failed to load applications"); setLoading(false); });
  }, [isAuthorized, user]);

  if (!isAuthorized) { navigateTo("/"); return null; }

  const deleteApplication = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(data.message);
      setApplications(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    const backup = [...applications];
    setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/status/${appId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message);
    } catch (err) {
      setApplications(backup);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className={`ma-root ${isEmployer ? "employer" : "seeker"}`}>
      {/* HEADER */}
      <div className="ma-header">
        <div className="ma-header-inner">
          <p className="ma-kicker">{isEmployer ? "Employer Dashboard" : "My Account"}</p>
          <h1 className="ma-h1">
            {isEmployer ? "Applications Received" : "My Applications"}
          </h1>
          <p className="ma-sub">
            {isEmployer
              ? "Review and respond to job seekers who applied to your listings"
              : "Track the status of jobs you've applied to"}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="ma-body">
        {!loading && (
          <p className="ma-count">
            <strong>{applications.length}</strong> application{applications.length !== 1 ? "s" : ""}
          </p>
        )}

        <div className="ma-list">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div className="ma-skeleton" key={i} />)
          ) : applications.length === 0 ? (
            <div className="ma-empty">
              <p>{isEmployer ? "No applications received yet." : "You haven't applied to any jobs yet."}</p>
            </div>
          ) : applications.map((app, i) =>
            isEmployer ? (
              app._id && (
                <EmployerCard key={app._id}
                  element={app}
                  openModal={setModalUrl}
                  handleStatusChange={handleStatusChange}
                  navigateTo={navigateTo}
                />
              )
            ) : (
              <JobSeekerCard key={app._id || `app-${i}`}
                element={app}
                deleteApplication={deleteApplication}
                openModal={setModalUrl}
                navigateTo={navigateTo}
              />
            )
          )}
        </div>
      </div>

      {modalUrl && <ResumeModal imageUrl={modalUrl} onClose={() => setModalUrl(null)} />}
    </div>
  );
};

export default MyApplications;
