import axios from "axios";
import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Context } from "../../main";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaArrowLeft, FaFile, FaTimes } from "react-icons/fa";
import "./Application.css";

const Application = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();

  if (!isAuthorized || (user && user.role === "Employer")) {
    navigateTo("/");
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  const handleApplication = async (e) => {
    e.preventDefault();
    if (!name || !email || !coverLetter || !phone || !address) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("coverLetter", coverLetter);
    formData.append("jobId", id);
    if (resume) formData.append("resume", resume);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/post`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(data.message);
      setName(""); setEmail(""); setCoverLetter("");
      setPhone(""); setAddress(""); setResume(null);
      navigateTo("/job/getall");
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-root">
      {/* HEADER */}
      <div className="app-header">
        <div className="app-header-inner">
          <Link to={`/job/${id}`} className="app-back">
            <FaArrowLeft /> Back to job
          </Link>
          <p className="app-kicker">Job Application</p>
          <h1 className="app-h1">Apply for this Position</h1>
          <p className="app-sub">Fill in your details below — takes less than 2 minutes</p>
        </div>
      </div>

      {/* BODY */}
      <div className="app-body">
        <form className="app-form" onSubmit={handleApplication}>

          {/* PERSONAL INFO */}
          <div className="app-section">
            <div className="app-section-title"><FaUser /> Personal Information</div>

            <div className="app-row">
              <div className="app-field">
                <label className="app-label">Full Name *</label>
                <input className="app-input" type="text" placeholder="e.g. James Mwangi"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="app-field">
                <label className="app-label">Phone Number *</label>
                <input className="app-input" type="tel" placeholder="+254 712 345 678"
                  value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="app-field">
              <label className="app-label">Email Address *</label>
              <input className="app-input" type="email" placeholder="your.email@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="app-field">
              <label className="app-label">Your Address / Location *</label>
              <input className="app-input" type="text" placeholder="e.g. Westlands, Nairobi"
                value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
          </div>

          {/* COVER LETTER */}
          <div className="app-section">
            <div className="app-section-title"><FaFileAlt /> Your Pitch *</div>
            <div className="app-field">
              <label className="app-label">Why should this employer hire you?</label>
              <textarea className="app-textarea"
                placeholder="Tell the employer about your skills, experience, and why you're the right person for this job. Be specific — mention relevant work you've done before."
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} required />
            </div>
          </div>

          {/* RESUME — OPTIONAL */}
          <div className="app-section">
            <div className="app-section-title">
              <FaFile /> Supporting Document
              <span className="app-optional-badge">Optional</span>
            </div>
            <div className="app-field">
              <label className="app-label">Photo of your work, ID, or certificate (PNG/JPG/WEBP)</label>
              {resume ? (
                <div className="app-file-selected">
                  <FaFile />
                  <span>{resume.name}</span>
                  <button type="button"
                    style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#9b8e83'}}
                    onClick={() => setResume(null)}>
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="app-file-area">
                  <div className="app-file-icon">📎</div>
                  <p className="app-file-label">Click to upload a file</p>
                  <p className="app-file-hint">PNG, JPG, JPEG, WEBP — not required</p>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange} className="app-file-input" />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="app-submit" disabled={submitting}>
            {submitting ? "Sending Application..." : "Send Application →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Application;
