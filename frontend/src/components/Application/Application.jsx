import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Context } from "../../main";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaFileAlt, FaArrowLeft, FaFile, FaTimes, FaLock, FaCrown,
} from "react-icons/fa";
import "./Application.css";
import { PremiumModal } from "../PremiumGate/PremiumGate";

const Application = () => {
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id }     = useParams();

  const [coverLetter, setCoverLetter] = useState("");
  const [resume,      setResume]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [remaining,   setRemaining]   = useState(null); // null = loading
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPremium =
    user?.role === "Admin" ||
    (user?.isPremium && (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date()));

  if (!isAuthorized || (user && user.role === "Employer")) {
    navigateTo("/");
    return null;
  }

  // Fetch today's application count
  useEffect(() => {
    if (!user || user.role !== "Job Seeker") return;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/application/today-count`, {
        withCredentials: true,
      })
      .then(({ data }) => setRemaining(data.remaining))
      .catch(() => setRemaining(null));
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  const handleApplication = async (e) => {
    e.preventDefault();

    if (!isPremium && remaining === 0) {
      setShowUpgrade(true);
      return;
    }

    if (!coverLetter.trim()) {
      toast.error("Please write your pitch before submitting.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name",        user.name);
    formData.append("email",       user.email);
    formData.append("phone",       user.phone);
    formData.append("address",     user.address || "");
    formData.append("coverLetter", coverLetter);
    formData.append("jobId",       id);
    if (resume) formData.append("resume", resume);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/post`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(data.message);
      if (data.remaining !== null) setRemaining(data.remaining);
      setCoverLetter("");
      setResume(null);
      navigateTo("/job/getall");
    } catch (error) {
      if (error.response?.data?.limitReached) {
        setShowUpgrade(true);
        setRemaining(0);
      } else {
        toast.error(error.response?.data?.message || "Application failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-root">

      {showUpgrade && <PremiumModal onClose={() => setShowUpgrade(false)} />}

      {/* HEADER */}
      <div className="app-header">
        <div className="app-header-inner">
          <Link to={`/job/${id}`} className="app-back">
            <FaArrowLeft /> Back to job
          </Link>
          <p className="app-kicker">Job Application</p>
          <h1 className="app-h1">Apply for this Position</h1>
          <p className="app-sub">Fill in your details below -- takes less than 2 minutes</p>
        </div>
      </div>

      {/* BODY */}
      <div className="app-body">

        {/* Daily limit banner for free users */}
        {!isPremium && remaining !== null && (
          <div className={`app-limit-banner ${remaining === 0 ? "danger" : remaining === 1 ? "warn" : "info"}`}>
            {remaining === 0 ? (
              <>
                <FaCrown style={{ color: "#e07b4f" }} />
                You have used all 3 free applications for today.
                <button className="app-upgrade-link" onClick={() => setShowUpgrade(true)}>
                  Upgrade to Premium
                </button>
                for unlimited applications.
              </>
            ) : (
              <>
                <span>{remaining} of 3 free applications remaining today.</span>
                <button className="app-upgrade-link" onClick={() => setShowUpgrade(true)}>
                  Go Premium
                </button>
                for unlimited.
              </>
            )}
          </div>
        )}

        {isPremium && (
          <div className="app-limit-banner premium">
            <FaCrown /> Premium account -- unlimited applications.
          </div>
        )}

        <form className="app-form" onSubmit={handleApplication}>

          {/* PERSONAL INFO */}
          <div className="app-section">
            <div className="app-section-title">
              <FaUser /> Personal Information
              <span className="app-lock-note">
                <FaLock style={{ fontSize: "10px" }} />
                Auto-filled from your profile --{" "}
                <Link to="/profile" className="app-edit-link">edit profile</Link>
              </span>
            </div>

            <div className="app-row">
              <div className="app-field">
                <label className="app-label">Full Name</label>
                <div className="app-input app-input-locked">
                  <FaUser className="app-locked-icon" />
                  {user?.name || "--"}
                </div>
              </div>
              <div className="app-field">
                <label className="app-label">Phone Number</label>
                <div className="app-input app-input-locked">
                  <FaPhone className="app-locked-icon" />
                  {user?.phone || "--"}
                </div>
              </div>
            </div>

            <div className="app-field">
              <label className="app-label">Email Address</label>
              <div className="app-input app-input-locked">
                <FaEnvelope className="app-locked-icon" />
                {user?.email || "--"}
              </div>
            </div>

            <div className="app-field">
              <label className="app-label">Your Address / Location</label>
              <div className="app-input app-input-locked">
                <FaMapMarkerAlt className="app-locked-icon" />
                {user?.address || <span style={{ opacity: 0.5 }}>Not set -- add in your profile</span>}
              </div>
            </div>
          </div>

          {/* COVER LETTER */}
          <div className="app-section">
            <div className="app-section-title"><FaFileAlt /> Your Pitch *</div>
            <div className="app-field">
              <label className="app-label">Why should this employer hire you?</label>
              <textarea
                className="app-textarea"
                placeholder="Tell the employer about your skills, experience, and why you're the right person for this job."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                required
                disabled={!isPremium && remaining === 0}
              />
            </div>
          </div>

          {/* RESUME */}
          <div className="app-section">
            <div className="app-section-title">
              <FaFile /> Supporting Document
              <span className="app-optional-badge">Optional</span>
            </div>
            <div className="app-field">
              <label className="app-label">
                Photo of your work, ID, or certificate (PNG/JPG/WEBP)
              </label>
              {resume ? (
                <div className="app-file-selected">
                  <FaFile />
                  <span>{resume.name}</span>
                  <button
                    type="button"
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9b8e83" }}
                    onClick={() => setResume(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="app-file-area">
                  <div className="app-file-icon">📎</div>
                  <p className="app-file-label">Click to upload a file</p>
                  <p className="app-file-hint">PNG, JPG, JPEG, WEBP -- not required</p>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="app-file-input"
                    disabled={!isPremium && remaining === 0}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="app-submit"
            disabled={submitting || (!isPremium && remaining === 0)}
          >
            {submitting
              ? "Sending Application..."
              : (!isPremium && remaining === 0)
              ? "Daily Limit Reached -- Upgrade to Continue"
              : "Send Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Application;
