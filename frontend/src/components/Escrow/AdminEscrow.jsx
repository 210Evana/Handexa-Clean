import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./EscrowPanel.css";

const API = import.meta.env.VITE_BACKEND_URL;

const STATUS_LABEL = {
  pending:        "Awaiting Payment",
  paid:           "Payment Confirmed",
  in_progress:    "In Progress",
  work_submitted: "Work Submitted",
  completed:      "Pending Release",
  released:       "Released",
  disputed:       "Disputed",
  refunded:       "Refunded",
};

const AdminEscrow = () => {
  const [escrows, setEscrows] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [busy,    setBusy]    = useState(null); // applicationId being processed

  const fetchEscrows = async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/v1/escrow/admin/all`,
        { withCredentials: true }
      );
      setEscrows(data.escrows || []);
      setStats(data.stats || null);
    } catch {
      toast.error("Failed to load escrow data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEscrows(); }, []);

  const handleAction = async (applicationId, endpoint, body = {}) => {
    setBusy(applicationId);
    try {
      const { data } = await axios.put(
        `${API}/api/v1/escrow/${applicationId}/${endpoint}`,
        body,
        { withCredentials: true }
      );
      toast.success(data.message);
      await fetchEscrows();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const handleAutoRelease = async () => {
    try {
      const { data } = await axios.post(
        `${API}/api/v1/escrow/admin/auto-release`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message);
      await fetchEscrows();
    } catch (err) {
      toast.error("Auto-release failed");
    }
  };

  const filtered = filter === "all"
    ? escrows
    : escrows.filter(e => e.status === filter);

  return (
    <div className="escrow admin">
      <div className="escrow-card">

        {/* ── Stats ── */}
        {stats && (
          <div className="escrow-amount-row" style={{ marginBottom: 20 }}>
            <div className="escrow-amount-box">
              <div className="escrow-amount-label">Total Held</div>
              <div className="escrow-amount-value accent">
                KES {stats.totalHeld?.toLocaleString() || 0}
              </div>
            </div>
            <div className="escrow-amount-box">
              <div className="escrow-amount-label">Platform Earned</div>
              <div className="escrow-amount-value">
                KES {stats.totalEarned?.toLocaleString() || 0}
              </div>
            </div>
            <div className="escrow-amount-box">
              <div className="escrow-amount-label">Disputed</div>
              <div className="escrow-amount-value" style={{ color: stats.disputed > 0 ? "#dc2626" : "inherit" }}>
                {stats.disputed || 0}
              </div>
            </div>
            <div className="escrow-amount-box">
              <div className="escrow-amount-label">Pending Confirm</div>
              <div className="escrow-amount-value">{stats.pending || 0}</div>
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="escrow-input"
            style={{ maxWidth: 200, marginBottom: 0 }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Escrows</option>
            <option value="pending">Awaiting Payment</option>
            <option value="in_progress">In Progress</option>
            <option value="work_submitted">Work Submitted</option>
            <option value="completed">Pending Release</option>
            <option value="disputed">Disputed ⚠️</option>
            <option value="released">Released</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            className="escrow-btn escrow-btn-ghost"
            onClick={handleAutoRelease}
          >
            ⚡ Process Auto-Releases
          </button>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading escrow data…
          </div>
        ) : (
          <div className="escrow-admin-table-wrap">
            <table className="escrow-admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Employer</th>
                  <th>Seeker</th>
                  <th>Amount</th>
                  <th>Platform Fee</th>
                  <th>Status</th>
                  <th>M-Pesa Ref</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No escrows found
                    </td>
                  </tr>
                ) : (
                  filtered.map(e => (
                    <tr key={e._id}>
                      <td style={{ fontWeight: 500 }}>{e.jobId?.title || "—"}</td>
                      <td>
                        <div>{e.employerId?.name || "—"}</div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>{e.employerId?.phone}</div>
                      </td>
                      <td>
                        <div>{e.seekerId?.name || "—"}</div>
                        <div style={{ fontSize: "0.72rem", opacity: 0.6 }}>{e.seekerId?.phone}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>KES {e.agreedAmount?.toLocaleString()}</td>
                      <td>KES {e.platformFee?.toLocaleString()}</td>
                      <td>
                        <span className={`escrow-status ${e.status}`}>
                          {STATUS_LABEL[e.status] || e.status}
                        </span>
                        {e.disputeReason && (
                          <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 4 }}>
                            "{e.disputeReason}"
                          </div>
                        )}
                        {e.autoReleaseAt && e.status === "completed" && (
                          <div style={{ fontSize: "0.7rem", opacity: 0.6, marginTop: 2 }}>
                            Auto-release: {new Date(e.autoReleaseAt).toLocaleDateString("en-GB")}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {e.mpesaReference || "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {/* Confirm payment */}
                          {e.status === "pending" && e.mpesaReference && (
                            <button
                              className="escrow-btn escrow-btn-primary"
                              style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                              onClick={() => handleAction(e.applicationId, "confirm-payment")}
                              disabled={busy === e.applicationId}
                            >
                              ✓ Confirm
                            </button>
                          )}
                          {/* Release */}
                          {["completed", "disputed"].includes(e.status) && (
                            <button
                              className="escrow-btn escrow-btn-primary"
                              style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                              onClick={() => handleAction(e.applicationId, "release")}
                              disabled={busy === e.applicationId}
                            >
                              💸 Release
                            </button>
                          )}
                          {/* Refund */}
                          {["paid", "in_progress", "work_submitted", "completed", "disputed"].includes(e.status) && (
                            <button
                              className="escrow-btn escrow-btn-danger"
                              style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                              onClick={() => handleAction(e.applicationId, "refund")}
                              disabled={busy === e.applicationId}
                            >
                              ↩ Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEscrow;
