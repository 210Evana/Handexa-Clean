import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch stats once on mount
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/stats`, {
        withCredentials: true,
      })
      .then((res) => setStats(res.data.stats))
      .catch(() => toast.error("Failed to load stats"));
  }, []);

  // Fetch data based on selected view
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (view === "users") {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users`,
            { withCredentials: true }
          );
          setUsers(res.data.users);
        } else if (view === "jobs") {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/jobs`,
            { withCredentials: true }
          );
          setJobs(res.data.jobs);
        } else if (view === "applications") {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/applications`,
            { withCredentials: true }
          );
          setApplications(res.data.application); // matches backend key
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error loading data");
      }
    };

    fetchData();
  }, [view]);

  // Update user status
  const handleUserStatus = async (userId, status) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users/${userId}/status`,
        { status },
        { withCredentials: true }
      );

      toast.success(res.data.message);

      // Refresh users after update
      const updated = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/users`,
        { withCredentials: true }
      );
      setUsers(updated.data.users);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin</h2>
        <h2>Dashboard</h2>
        <button
          className={view === "users" ? "active" : ""}
          onClick={() => setView("users")}
        >
          Users
        </button>
        <button
          className={view === "jobs" ? "active" : ""}
          onClick={() => setView("jobs")}
        >
          Jobs
        </button>
        <button
          className={view === "applications" ? "active" : ""}
          onClick={() => setView("applications")}
        >
          Applications
        </button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <h2>
          {view === "users"
            ? "All Users"
            : view === "jobs"
            ? "All Jobs"
            : "All Applications"}
        </h2>

        {/* Stats */}
        {stats && (
          <div className="stats-bar">
            <p>Total Users: {stats.totalUsers}</p>
            <p>Employers: {stats.totalEmployers}</p>
            <p>Job Seekers: {stats.totalJobSeekers}</p>
            <p>Jobs Posted: {stats.totalJobs}</p>
            <p>Applications Made: {stats.totalApplications}</p>
          </div>
        )}

        {/* Users Table */}
        {view === "users" && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="approve"
                      onClick={() => handleUserStatus(user._id, "approved")}
                      disabled={user.status === "approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="block"
                      onClick={() => handleUserStatus(user._id, "blocked")}
                      disabled={user.status === "blocked"}
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Jobs Table */}
        {view === "jobs" && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Posted By</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.title}</td>
                  <td>{job.category}</td>
                  <td>{job.postedBy?.name || job.postedBy?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Applications Table */}
        {view === "applications" && (
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Employer</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.applicantID?.user?.name}</td>
                    <td>{app.employerID?.user?.name}</td>
                    <td>{app.status || "pending"}</td>
                    <td>{app.paymentStatus || "unpaid"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
