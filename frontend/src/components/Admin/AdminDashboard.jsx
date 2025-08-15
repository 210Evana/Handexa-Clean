import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

const TABS = ["users", "jobs", "applications"];

const StatCard = ({ label, value, hint }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? 0}</div>
    {hint ? <div className="stat-hint">{hint}</div> : null}
  </div>
);

const Pill = ({ text, tone = "neutral" }) => (
  <span className={`pill pill-${tone}`}>{text}</span>
);

const AdminDashboard = () => {
  const [view, setView] = useState("users");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // -------- Load Stats (once) ----------
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/stats`, {
        withCredentials: true,
      })
      .then((res) => setStats(res.data?.stats || null))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load stats");
      });
  }, []);

  // -------- Load Table Data (on tab change) ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
          // backend returns { application: [...] }
          setApplications(res.data?.application || []);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  // -------- Actions ----------
  const handleUserStatus = async (userId, status) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users/${userId}/status`,
        { status }, // "approved" | "blocked"
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Status updated");

      // refresh users list
      const updated = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users`,
        { withCredentials: true }
      );
      setUsers(updated.data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // -------- Client-side filtering for Users tab ----------
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

  return (
    <div className="admin__wrap">
      {/* Sidebar */}
      <aside className="admin__sidebar">
        <div className="sidebar__title">Admin</div>
        <div className="sidebar__subtitle">Dashboard</div>

        <div className="sidebar__tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`sidebar__tab ${view === t ? "active" : ""}`}
              onClick={() => setView(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="admin__main">
        {/* Stats */}
        <section className="stats__grid">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers}
            hint="All registered users"
          />
          <StatCard
            label="Employers"
            value={stats?.totalEmployers}
            hint="Company accounts"
          />
          <StatCard
            label="Job Seekers"
            value={stats?.totalJobSeekers}
            hint="Candidate accounts"
          />
          <StatCard
            label="Jobs Posted"
            value={stats?.totalJobs}
            hint="Openings created"
          />
          <StatCard
            label="Applications"
            value={stats?.totalApplications}
            hint="Submissions made"
          />
        </section>

        {/* Header + Tools */}
        <div className="table__header">
          <h2 className="table__title">
            {view === "users" ? "Users" : view === "jobs" ? "Jobs" : "Applications"}
          </h2>

          {view === "users" && (
            <div className="table__tools">
              <input
                className="input"
                placeholder="Search name, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="select"
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

        {/* Tables */}
        <div className="table__card">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : view === "users" ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || "-"}</td>
                      <td>
                        <Pill
                          text={u.role}
                          tone={
                            u.role === "Employer"
                              ? "info"
                              : u.role === "Job Seeker"
                              ? "success"
                              : "neutral"
                          }
                        />
                      </td>
                      <td>
                        <Pill
                          text={u.status || "pending"}
                          tone={
                            u.status === "approved"
                              ? "success"
                              : u.status === "blocked"
                              ? "danger"
                              : "warn"
                          }
                        />
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-approve"
                            onClick={() => handleUserStatus(u._id, "approved")}
                            disabled={u.status === "approved"}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-block"
                            onClick={() => handleUserStatus(u._id, "blocked")}
                            disabled={u.status === "blocked"}
                          >
                            Block
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : view === "jobs" ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Posted By</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length ? (
                  jobs.map((j) => (
                    <tr key={j._id}>
                      <td>{j.title}</td>
                      <td>{j.category || "-"}</td>
                      <td>{j.location || "-"}</td>
                      <td>{j.postedBy?.name || j.postedBy?.email || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Applicant</th>
                  <th>Employer</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {applications.length ? (
                  applications.map((a) => (
                    <tr key={a._id}>
                      <td>{a.jobId?.title || "-"}</td>
                      <td>{a.applicantID?.user?.name || "-"}</td>
                      <td>{a.employerID?.user?.name || "-"}</td>
                      <td>
                        <Pill
                          text={a.status || "pending"}
                          tone={
                            a.status === "accepted"
                              ? "success"
                              : a.status === "rejected"
                              ? "danger"
                              : "warn"
                          }
                        />
                      </td>
                      <td>{a.payment || "Unpaid"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
