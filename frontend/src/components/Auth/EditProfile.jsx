import React, { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import {
  FaArrowLeft, FaUser, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaFileAlt, FaBriefcase,
  FaLock, FaFile, FaTimes,
} from "react-icons/fa";
import "./EditProfile.css";

const NICHES = [
  "Cleaning & Domestic Services", "Chefs & Cooks", "Nannies",
  "Photographers", "Househelps", "Laundry Services", "Construction",
  "Artisans", "Gardeners", "Electrical & Wiring Services",
  "Tailoring & Fashion Design", "Carpentry & Furniture Making",
  "Plumbing & Repairs", "Masseuse/Masseur", "Event Planners",
  "Nail Technicians", "Make Up Artists", "Fumigators", "Painter",
  "Drivers", "Farming & Agriculture", "Food Vending & Catering",
  "Other Informal Jobs",
];

/* ─── Initials avatar ─── */
const initials = (name) =>
  name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "?";

const EditProfile = () => {
  const { user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  if (!user) { navigateTo("/login"); return null; }

  const isSeeker   = user.role === "Job Seeker";
  const isEmployer = user.role === "Employer";
  const roleClass  = isEmployer ? "employer" : "seeker";

  /* ── Form state pre-filled from user ── */
  const [name,        setName]        = useState(user.name        || "");
  const [email,       setEmail]       = useState(user.email       || "");
  const [phone,       setPhone]       = useState(user.phone       || "");
  const [address,     setAddress]     = useState(user.address     || "");
  const [coverLetter, setCoverLetter] = useState(user.coverLetter || "");
  const [firstNiche,  setFirstNiche]  = useState(user.niches?.firstNiche  || "");
  const [secondNiche, setSecondNiche] = useState(user.niches?.secondNiche || "");
  const [thirdNiche,  setThirdNiche]  = useState(user.niches?.thirdNiche  || "");
  const [resume,      setResume]      = useState(null);

  /* ── Password change (optional) ── */
  const [showPassword,    setShowPassword]    = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill in all password fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name",        name);
    formData.append("email",       email);
    formData.append("phone",       phone);
    formData.append("address",     address);
    formData.append("coverLetter", coverLetter);

    if (isSeeker) {
      formData.append("firstNiche",  firstNiche);
      formData.append("secondNiche", secondNiche);
      formData.append("thirdNiche",  thirdNiche);
    }

    if (resume) formData.append("resume", resume);

    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update context so the rest of the app reflects changes immediately
      setUser(data.user);
      toast.success("Profile updated successfully!");
      navigateTo("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`ep-root ${roleClass}`}>

      {/* ── HEADER ── */}
      <div className="ep-header">
        <div className="ep-header-inner">
          <Link to="/" className="ep-back">
            <FaArrowLeft /> Back
          </Link>
          <p className="ep-kicker">Account Settings</p>
          <h1 className="ep-h1">Edit Profile</h1>
          <p className="ep-sub">Update your information — changes apply to all future applications</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ep-body">
        <form onSubmit={handleSubmit}>

          {/* ── AVATAR ROW ── */}
          <div className="ep-avatar-row">
            {user.resume?.url ? (
              <img src={user.resume.url} alt="profile" className="ep-avatar-img" />
            ) : (
              <div className="ep-avatar-circle">{initials(user.name)}</div>
            )}
            <div className="ep-avatar-info">
              <div className="ep-avatar-name">{user.name}</div>
              <div className="ep-avatar-role">{user.role}</div>
            </div>
          </div>

          {/* ── PERSONAL INFO ── */}
          <div className="ep-section">
            <div className="ep-section-title">
              <FaUser className="ep-section-icon" /> Personal Information
            </div>

            <div className="ep-row">
              <div className="ep-field">
                <label className="ep-label">Full Name *</label>
                <input
                  className="ep-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="ep-field">
                <label className="ep-label">Phone Number *</label>
                <input
                  className="ep-input"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  required
                />
              </div>
            </div>

            <div className="ep-field">
              <label className="ep-label">Email Address *</label>
              <input
                className="ep-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="ep-field">
              <label className="ep-label">Address / Location *</label>
              <input
                className="ep-input"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Westlands, Nairobi"
                required
              />
            </div>
          </div>

          {/* ── COVER LETTER (seekers only) ── */}
          {isSeeker && (
            <div className="ep-section">
              <div className="ep-section-title">
                <FaFileAlt className="ep-section-icon" /> Default Cover Letter
              </div>
              <div className="ep-field">
                <label className="ep-label">
                  A brief bio about your skills and experience
                </label>
                <textarea
                  className="ep-textarea"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell employers about your skills and experience..."
                />
              </div>
            </div>
          )}

          {/* ── NICHES (seekers only) ── */}
          {isSeeker && (
            <div className="ep-section">
              <div className="ep-section-title">
                <FaBriefcase className="ep-section-icon" /> Your Skills / Niches
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
                Select up to 3 job categories you specialise in
              </p>
              <div className="ep-row">
                <div className="ep-field">
                  <label className="ep-label">Primary Skill</label>
                  <select
                    className="ep-select"
                    value={firstNiche}
                    onChange={e => setFirstNiche(e.target.value)}
                  >
                    <option value="">Select a skill</option>
                    {NICHES.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="ep-field">
                  <label className="ep-label">Secondary Skill</label>
                  <select
                    className="ep-select"
                    value={secondNiche}
                    onChange={e => setSecondNiche(e.target.value)}
                  >
                    <option value="">Select a skill</option>
                    {NICHES.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ep-field">
                <label className="ep-label">Third Skill (optional)</label>
                <select
                  className="ep-select"
                  value={thirdNiche}
                  onChange={e => setThirdNiche(e.target.value)}
                >
                  <option value="">Select a skill</option>
                  {NICHES.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── PROFILE DOCUMENT / RESUME ── */}
          <div className="ep-section">
            <div className="ep-section-title">
              <FaFile className="ep-section-icon" />
              {isSeeker ? "Profile Document / Resume" : "Company Logo / Profile Image"}
            </div>

            {/* Show current resume if exists */}
            {user.resume?.url && !resume && (
              <div className="ep-current-resume">
                <img
                  src={user.resume.url}
                  alt="current"
                  className="ep-current-thumb"
                  onClick={() => window.open(user.resume.url, "_blank")}
                />
                <span className="ep-current-label">
                  Current document — upload a new one to replace it
                </span>
              </div>
            )}

            {resume ? (
              <div className="ep-file-selected">
                <FaFile />
                <span>{resume.name}</span>
                <button
                  type="button"
                  className="ep-file-remove"
                  onClick={() => setResume(null)}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="ep-file-area">
                <div className="ep-file-icon">📎</div>
                <p className="ep-file-label">Click to upload a new file</p>
                <p className="ep-file-hint">PNG, JPG, WEBP</p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className="ep-file-input"
                  onChange={e => setResume(e.target.files[0] || null)}
                />
              </div>
            )}
          </div>

          {/* ── SUBMIT ── */}
          <div className="ep-submit-row">
            <button type="submit" className="ep-submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes →"}
            </button>
            <Link to="/" className="ep-cancel">Cancel</Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;
