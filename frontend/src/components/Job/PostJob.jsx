import React, { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaAlignLeft } from "react-icons/fa";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [county, setCounty] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [submitting, setSubmitting] = useState(false);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/"); return null;
  }

  const handleJobPost = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !county || !location) {
      toast.error("Please fill in all required fields."); return;
    }
    if (salaryType === "default") { toast.error("Select a salary type."); return; }
    if (salaryType === "Fixed Salary" && !fixedSalary) { toast.error("Enter a fixed salary."); return; }
    if (salaryType === "Ranged Salary" && (!salaryFrom || !salaryTo)) { toast.error("Enter salary range."); return; }

    setSubmitting(true);
    try {
      const payload = fixedSalary
        ? { title, description, category, county, location, fixedSalary }
        : { title, description, category, county, location, salaryFrom, salaryTo };
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/post`, payload, {
        withCredentials: true, headers: { "Content-Type": "application/json" },
      });
      toast.success(res.data.message);
      setTitle(""); setDescription(""); setCategory(""); setCounty("");
      setLocation(""); setSalaryFrom(""); setSalaryTo(""); setFixedSalary("");
      setSalaryType("default");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["Cleaning & Domestic Services","Chefs & Cooks","Nannies","Photographers","Househelps","Laundry Services","Construction","Artisans","Gardeners","Electrical & Wiring Services","Tailoring & Fashion Design","Carpentry & Furniture Making","Plumbing & Repairs","Masseuse/Masseur","Event Planners","Nail Technicians","Make Up Artists","Fumigators","Painter","Drivers","Farming & Agriculture","Food Vending & Catering","Other Informal Jobs"];
  const counties = ["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pj-root {
          background: #0a0f1e; min-height: 100vh;
          font-family: 'DM Sans', sans-serif; color: #e8eaf2;
        }

        .pj-header {
          background: #0d1424;
          border-bottom: 1px solid rgba(163,230,53,.1);
          padding: 48px 40px 40px;
        }
        .pj-header-inner { max-width: 800px; margin: 0 auto; }
        .pj-kicker { font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #a3e635; margin-bottom: 12px; }
        .pj-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,4vw,3.5rem); color: #fff; margin: 0 0 8px; line-height: 1; }
        .pj-sub { font-size: .9rem; color: rgba(232,234,242,.4); margin: 0; }

        .pj-body { max-width: 800px; margin: 0 auto; padding: 40px; }

        .pj-form { display: flex; flex-direction: column; gap: 28px; }

        /* SECTION */
        .pj-section {
          background: #111827;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 28px 32px;
        }
        .pj-section-title {
          display: flex; align-items: center; gap: 10px;
          font-size: .8rem; letter-spacing: .12em; text-transform: uppercase;
          color: #a3e635; margin-bottom: 20px; font-weight: 600;
        }
        .pj-section-title svg { font-size: 13px; }

        /* FIELD */
        .pj-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .pj-field:last-child { margin-bottom: 0; }
        .pj-label { font-size: .8rem; color: rgba(232,234,242,.5); font-weight: 500; letter-spacing: .04em; }
        .pj-input, .pj-select, .pj-textarea {
          background: #0d1424;
          border: 1.5px solid rgba(255,255,255,.08);
          border-radius: 8px; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem; color: #e8eaf2; outline: none;
          transition: border-color .2s; width: 100%; box-sizing: border-box;
        }
        .pj-input::placeholder { color: rgba(232,234,242,.2); }
        .pj-input:focus, .pj-select:focus, .pj-textarea:focus {
          border-color: #a3e635;
        }
        .pj-select { cursor: pointer; }
        .pj-select option { background: #111827; }
        .pj-textarea { resize: vertical; min-height: 140px; line-height: 1.7; }

        /* 2-COL */
        .pj-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* SALARY TYPE BUTTONS */
        .pj-salary-type { display: flex; gap: 10px; margin-bottom: 16px; }
        .pj-type-btn {
          flex: 1; padding: 10px; border-radius: 8px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: .875rem; font-weight: 500;
          border: 1.5px solid rgba(255,255,255,.08);
          background: #0d1424; color: rgba(232,234,242,.5);
          transition: all .2s;
        }
        .pj-type-btn.active {
          border-color: #a3e635; background: rgba(163,230,53,.08); color: #a3e635;
        }
        .pj-type-btn:hover:not(.active) { border-color: rgba(163,230,53,.3); color: #e8eaf2; }

        .pj-salary-hint { font-size: .78rem; color: rgba(232,234,242,.3); font-style: italic; }

        /* SUBMIT */
        .pj-submit {
          background: #a3e635; color: #0a0f1e;
          border: none; border-radius: 10px;
          padding: 16px; font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 700; cursor: pointer;
          transition: opacity .2s, transform .2s; width: 100%;
          letter-spacing: .03em;
        }
        .pj-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .pj-submit:disabled { opacity: .5; cursor: not-allowed; }

        @media(max-width:768px) {
          .pj-header { padding: 32px 20px 28px; }
          .pj-body { padding: 24px 20px; }
          .pj-row { grid-template-columns: 1fr; }
          .pj-section { padding: 20px; }
        }
      `}</style>

      <div className="pj-root">
        <div className="pj-header">
          <div className="pj-header-inner">
            <p className="pj-kicker">Employer Dashboard</p>
            <h1 className="pj-h1">Post a New Job</h1>
            <p className="pj-sub">Fill in the details below — takes less than 2 minutes</p>
          </div>
        </div>

        <div className="pj-body">
          <form className="pj-form" onSubmit={handleJobPost}>

            {/* JOB BASICS */}
            <div className="pj-section">
              <div className="pj-section-title"><FaBriefcase /> Job Details</div>
              <div className="pj-field">
                <label className="pj-label">Job Title *</label>
                <input className="pj-input" type="text" placeholder="e.g. Experienced Carpenter Needed" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="pj-row">
                <div className="pj-field">
                  <label className="pj-label">Category *</label>
                  <select className="pj-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="pj-field">
                  <label className="pj-label">County *</label>
                  <select className="pj-select" value={county} onChange={e => setCounty(e.target.value)}>
                    <option value="">Select county</option>
                    {counties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="pj-section">
              <div className="pj-section-title"><FaMapMarkerAlt /> Location</div>
              <div className="pj-field">
                <label className="pj-label">Specific Location / Area *</label>
                <input className="pj-input" type="text" placeholder="e.g. Westlands, Nairobi" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>

            {/* SALARY */}
            <div className="pj-section">
              <div className="pj-section-title"><FaMoneyBillWave /> Salary</div>
              <div className="pj-salary-type">
                <button type="button" className={`pj-type-btn ${salaryType === "Fixed Salary" ? "active" : ""}`} onClick={() => setSalaryType("Fixed Salary")}>Fixed Salary</button>
                <button type="button" className={`pj-type-btn ${salaryType === "Ranged Salary" ? "active" : ""}`} onClick={() => setSalaryType("Ranged Salary")}>Salary Range</button>
              </div>
              {salaryType === "default" && <p className="pj-salary-hint">Select a salary type above to continue</p>}
              {salaryType === "Fixed Salary" && (
                <div className="pj-field">
                  <label className="pj-label">Fixed Amount (KSh)</label>
                  <input className="pj-input" type="number" placeholder="e.g. 25000" value={fixedSalary} onChange={e => setFixedSalary(e.target.value)} />
                </div>
              )}
              {salaryType === "Ranged Salary" && (
                <div className="pj-row">
                  <div className="pj-field">
                    <label className="pj-label">Minimum (KSh)</label>
                    <input className="pj-input" type="number" placeholder="e.g. 15000" value={salaryFrom} onChange={e => setSalaryFrom(e.target.value)} />
                  </div>
                  <div className="pj-field">
                    <label className="pj-label">Maximum (KSh)</label>
                    <input className="pj-input" type="number" placeholder="e.g. 35000" value={salaryTo} onChange={e => setSalaryTo(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="pj-section">
              <div className="pj-section-title"><FaAlignLeft /> Description</div>
              <div className="pj-field">
                <label className="pj-label">Job Description *</label>
                <textarea className="pj-textarea" placeholder="Describe the role, required experience, working hours, and any other relevant details..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="pj-submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Job →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PostJob;
