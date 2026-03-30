import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./AdminDashboard.css";
import AdminEscrow from "../Escrow/AdminEscrow";

const TABS = [
  { key: "users",        label: "Users",        icon: "👤" },
  { key: "jobs",         label: "Jobs",         icon: "💼" },
  { key: "applications", label: "Applications", icon: "📋" },
  { key: "escrow",       label: "Escrow",       icon: "💰" },
];

/* ─── Initials avatar ─── */
const Avatar = ({ name }) => {
  const letters = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return <span className="ad-avatar">{letters}</span>;
};

/* ─── Status / role pill ─── */
const Pill = ({ text, tone = "neutral" }) => (
  <span className={`ad-pill ad-pill-${tone}`}>{text}</span>
);

/* ─── Shimmer loading rows ─── */
const ShimmerRows = ({ cols, rows = 5 }) => (
  <>
    {Array(rows).fill(0).map((_, i) => (
      <tr className="ad-shimmer-row" key={i}>
        {Array(cols).fill(0).map((_, j) => (
          <td key={j}>
            <div
              className="ad-shimmer-cell"
              style={{ width: j === 0 ? "60%" : j === cols - 1 ? "40%" : "75%" }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [view,         setView]         = useState("users");
  const [loading,      setLoading]      = useState(false);
  const [stats,        setStats]        = useState(null);
  const [users,        setUsers]        = useState([]);
  const [jobs,         setJobs]         = useState([]);
  const [applications, setApplications] = useState([]);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  /* ── Stats (once) ── */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/stats`, {
        withCredentials: true,
      })
      .then((res) => setStats(res.data?.stats || null))
      .catch(() => toast.error("Failed to load stats"));
  }, []);

  /* ── Table data (on tab change) ── */
  useEffect(() => {
    // Escrow tab is handled by AdminEscrow component itself
    if (view === "escrow") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (view === "users") {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users`,
            { withCredentials: true }
          );
          setUsers(res.data?.users || []);
        }
        if (view === "jobs") {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/jobs`,
            { withCredentials: true }
          );
          setJobs(res.data?.jobs || []);
        }
        if (view === "applications") {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/applications`,
            { withCredentials: true }
          );
          setApplications(res.data?.application || []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [view]);

  /* ── Approve / block user ── */
  const handleUserStatus = async (userId, status) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users/${userId}/status`,
        { status },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Status updated");
      const updated = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users`,
        { withCredentials: true }
      );
      setUsers(updated.data?.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  /* ── Grant / revoke premium ── */
  const handlePremium = async (userId, action) => {
    try {
      if (action === "grant") {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users/${userId}/premium`,
          { durationDays: 30 },
          { withCredentials: true }
        );
        toast.success(res.data?.message || "Premium granted (30 days)");
      } else {
        const res = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users/${userId}/premium`,
          { withCredentials: true }
        );
        toast.success(res.data?.message || "Premium revoked");
      }
      const updated = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users`,
        { withCredentials: true }
      );
      setUsers(updated.data?.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  /* ── Client-side filter for users ── */
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (roleFilter !== "all") {
      list = list.filter(
        (u) => (u.role || "").toLowerCase() === roleFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.role?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [users, roleFilter, search]);

  /* ── Tab counts ── */
  const countFor = (tab) => {
    if (tab === "users")        return users.length        || null;
    if (tab === "jobs")         return jobs.length         || null;
    if (tab === "applications") return applications.length || null;
    return null;
  };

  /* ── Section title per view ── */
  const sectionTitle = {
    users:        "All Users",
    jobs:         "All Jobs",
    applications: "All Applications",
    escrow:       "Escrow & Payments",
  }[view];

  /* ── Current row count (not shown for escrow) ── */
  const rowCount =
    view === "users"        ? filteredUsers.length  :
    view === "jobs"         ? jobs.length           :
    view === "applications" ? applications.length   : null;

  return (
    <div className="ad-wrap">

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <p className="ad-brand-eyebrow">Control Panel</p>
          <h1 className="ad-brand-name">Kazi<br />Haraka</h1>
          <p className="ad-brand-sub">Admin Dashboard</p>
        </div>

        <div className="ad-sidebar-divider" />

        <p className="ad-nav-label">Navigation</p>
        <nav className="ad-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`ad-tab ${view === t.key ? "active" : ""}`}
              onClick={() => setView(t.key)}
            >
              <span className="ad-tab-icon">{t.icon}</span>
              {t.label}
              {countFor(t.key) !== null && (
                <span className="ad-tab-count">{countFor(t.key)}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          Kazi Haraka Admin · {new Date().getFullYear()}
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main className="ad-main">

        {/* Page header */}
        <div className="ad-page-header">
          <div>
            <p className="ad-page-eyebrow">Welcome back</p>
            <h2 className="ad-page-title">Dashboard</h2>
          </div>
          <span className="ad-page-date">{today}</span>
        </div>

        {/* ── STAT CARDS ── */}
        <section className="ad-stats">
          <div className="ad-stat accent">
            <div className="ad-stat-icon">👥</div>
            <div className="ad-stat-value">{stats?.totalUsers ?? "—"}</div>
            <div className="ad-stat-label">Total Users</div>
            <div className="ad-stat-hint">All registered accounts</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-icon">🏢</div>
            <div className="ad-stat-value">{stats?.totalEmployers ?? "—"}</div>
            <div className="ad-stat-label">Employers</div>
            <div className="ad-stat-hint">Company accounts</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-icon">🌸</div>
            <div className="ad-stat-value">{stats?.totalJobSeekers ?? "—"}</div>
            <div className="ad-stat-label">Job Seekers</div>
            <div className="ad-stat-hint">Candidate accounts</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-icon">💼</div>
            <div className="ad-stat-value">{stats?.totalJobs ?? "—"}</div>
            <div className="ad-stat-label">Jobs Posted</div>
            <div className="ad-stat-hint">Active openings</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-icon">📬</div>
            <div className="ad-stat-value">{stats?.totalApplications ?? "—"}</div>
            <div className="ad-stat-label">Applications</div>
            <div className="ad-stat-hint">Total submissions</div>
          </div>
        </section>

        {/* ── ESCROW TAB — full-width, no table wrapper ── */}
        {view === "escrow" && (
          <section className="ad-section">
            <div className="ad-section-head">
              <div>
                <h3 className="ad-section-title">Escrow & Payments</h3>
              </div>
            </div>
            <div style={{ padding: "0 8px 8px" }}>
              <AdminEscrow />
            </div>
          </section>
        )}

        {/* ── TABLE SECTION (users / jobs / applications) ── */}
        {view !== "escrow" && (
          <section className="ad-section">

            {/* Section head */}
            <div className="ad-section-head">
              <div>
                <h3 className="ad-section-title">
                  {sectionTitle}
                  <span className="ad-section-count">
                    {!loading && rowCount !== null
                      ? `${rowCount} record${rowCount !== 1 ? "s" : ""}`
                      : ""}
                  </span>
                </h3>
              </div>

              {/* Tools — only on users tab */}
              {view === "users" && (
                <div className="ad-tools">
                  <input
                    className="ad-input"
                    placeholder="Search name, email, role…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="ad-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All roles</option>
                    <option value="Employer">Employers</option>
                    <option value="Job Seeker">Job Seekers</option>
                  </select>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="ad-table-wrap">

              {/* ── USERS ── */}
              {view === "users" && (
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Premium</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <ShimmerRows cols={7} />
                    ) : filteredUsers.length ? (
                      filteredUsers.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="ad-name-cell">
                              <Avatar name={u.name} />
                              <div>
                                <div className="ad-name-text">{u.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="ad-email-text">{u.email}</span>
                          </td>
                          <td>{u.phone || "—"}</td>
                          <td>
                            <Pill
                              text={u.role}
                              tone={
                                u.role === "Employer"   ? "info"    :
                                u.role === "Job Seeker" ? "rose"    : "neutral"
                              }
                            />
                          </td>
                          <td>
                            <Pill
                              text={u.status || "pending"}
                              tone={
                                u.status === "approved" ? "success" :
                                u.status === "blocked"  ? "danger"  : "warn"
                              }
                            />
                          </td>
                          <td>
                            {u.isPremium ? (
                              <Pill text="Premium ✦" tone="success" />
                            ) : (
                              <Pill text="Free" tone="neutral" />
                            )}
                            {u.premiumExpiresAt && (
                              <div style={{ fontSize: "0.7rem", opacity: 0.55, marginTop: 3 }}>
                                Expires {new Date(u.premiumExpiresAt).toLocaleDateString("en-GB")}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="ad-actions">
                              <button
                                className="ad-btn ad-btn-approve"
                                onClick={() => handleUserStatus(u._id, "approved")}
                                disabled={u.status === "approved"}
                              >
                                ✓ Approve
                              </button>
                              <button
                                className="ad-btn ad-btn-block"
                                onClick={() => handleUserStatus(u._id, "blocked")}
                                disabled={u.status === "blocked"}
                              >
                                ✕ Block
                              </button>
                              {u.role !== "Admin" && (
                                u.isPremium ? (
                                  <button
                                    className="ad-btn ad-btn-block"
                                    onClick={() => handlePremium(u._id, "revoke")}
                                    style={{ background: "#fef6e7", color: "#7a4800", border: "1px solid #f5d8a0" }}
                                  >
                                    ✕ Premium
                                  </button>
                                ) : (
                                  <button
                                    className="ad-btn ad-btn-approve"
                                    onClick={() => handlePremium(u._id, "grant")}
                                    style={{ background: "#f3eef2", color: "#5c2e58", border: "1px solid #d4b8d0" }}
                                  >
                                    ✦ Premium
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="ad-empty-row">
                        <td colSpan={7}>
                          <span className="ad-empty-icon">🌸</span>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* ── JOBS ── */}
              {view === "jobs" && (
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>County</th>
                      <th>Salary</th>
                      <th>Posted By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <ShimmerRows cols={6} />
                    ) : jobs.length ? (
                      jobs.map((j) => (
                        <tr key={j._id}>
                          <td><span style={{ fontWeight: 500 }}>{j.title}</span></td>
                          <td>{j.category || "—"}</td>
                          <td>{j.county || "—"}</td>
                          <td>
                            {j.fixedSalary
                              ? `KES ${j.fixedSalary.toLocaleString()}`
                              : j.salaryFrom && j.salaryTo
                              ? `KES ${j.salaryFrom.toLocaleString()} – ${j.salaryTo.toLocaleString()}`
                              : "—"}
                          </td>
                          <td>
                            <div className="ad-name-cell">
                              <Avatar name={j.postedBy?.name || "?"} />
                              <span className="ad-name-text">
                                {j.postedBy?.name || j.postedBy?.email || "—"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <Pill
                              text={j.expired ? "expired" : "active"}
                              tone={j.expired ? "danger" : "success"}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="ad-empty-row">
                        <td colSpan={6}>
                          <span className="ad-empty-icon">💼</span>
                          No jobs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* ── APPLICATIONS ── */}
              {view === "applications" && (
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Applicant</th>
                      <th>Employer</th>
                      <th>Status</th>
                      <th>Escrow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <ShimmerRows cols={5} />
                    ) : applications.length ? (
                      applications.map((a) => (
                        <tr key={a._id}>
                          <td>
                            <span style={{ fontWeight: 500 }}>
                              {a.jobId?.title || "—"}
                            </span>
                          </td>
                          <td>
                            <div className="ad-name-cell">
                              <Avatar name={a.applicantID?.user?.name || "?"} />
                              <span className="ad-name-text">
                                {a.applicantID?.user?.name || "—"}
                              </span>
                            </div>
                          </td>
                          <td>{a.employerID?.user?.name || "—"}</td>
                          <td>
                            <Pill
                              text={a.status || "pending"}
                              tone={
                                a.status === "accepted" ? "success" :
                                a.status === "rejected" ? "danger"  : "warn"
                              }
                            />
                          </td>
                          <td>
                            <Pill
                              text={a.escrowStatus || "none"}
                              tone={
                                a.escrowStatus === "released"    ? "success" :
                                a.escrowStatus === "in_progress" ? "info"    :
                                a.escrowStatus === "disputed"    ? "danger"  :
                                a.escrowStatus === "completed"   ? "success" :
                                a.escrowStatus === "refunded"    ? "warn"    : "neutral"
                              }
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="ad-empty-row">
                        <td colSpan={5}>
                          <span className="ad-empty-icon">📋</span>
                          No applications found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
