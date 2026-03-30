import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../main";
import "./EscrowPanel.css";

const API = import.meta.env.VITE_BACKEND_URL;

/* ─── Status label map ─── */
const STATUS_LABEL = {
  none:           "No Payment Yet",
  pending:        "Awaiting Payment",
  paid:           "Payment Confirmed",
  in_progress:    "In Progress",
  work_submitted: "Work Submitted",
  completed:      "Pending Release",
  released:       "Funds Released",
  disputed:       "Disputed",
  refunded:       "Refunded",
};

/* ─── Timeline steps ─── */
const TIMELINE_STEPS = [
  { key: "pending",        label: "Payment Initiated",    sub: "Employer sends M-Pesa payment" },
  { key: "in_progress",   label: "Payment Confirmed",    sub: "Admin verified M-Pesa receipt" },
  { key: "work_submitted", label: "Work Submitted",       sub: "Job seeker marked work as done" },
  { key: "completed",      label: "Employer Confirmed",   sub: "3-day dispute window opens" },
  { key: "released",       label: "Funds Released",       sub: "Job seeker receives payout" },
];

const STATUS_ORDER = ["pending", "in_progress", "work_submitted", "completed", "released"];

const getStepState = (stepKey, currentStatus) => {
  if (currentStatus === "disputed") return stepKey === "completed" ? "active" : "done";
  if (currentStatus === "refunded") return "waiting";
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const stepIdx    = STATUS_ORDER.indexOf(stepKey);
  if (stepIdx < currentIdx)  return "done";
  if (stepIdx === currentIdx) return "active";
  return "waiting";
};

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const EscrowPanel = ({ applicationId, applicationStatus }) => {
  const { user } = useContext(Context);
  const [escrow,        setEscrow]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [agreedAmount,  setAgreedAmount]  = useState("");
  const [mpesaRef,      setMpesaRef]      = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute,   setShowDispute]   = useState(false);
  const [adminNotes,    setAdminNotes]    = useState("");
  const [busy,          setBusy]          = useState(false);

  const isEmployer = user?.role === "Employer";
  const isSeeker   = user?.role === "Job Seeker";
  const isAdmin    = user?.role === "Admin";
  const roleClass  = isEmployer ? "employer" : isAdmin ? "admin" : "seeker";

  /* ── Fetch escrow ── */
  const fetchEscrow = async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/v1/escrow/${applicationId}`,
        { withCredentials: true }
      );
      setEscrow(data.escrow);
    } catch {
      // no escrow yet — that's fine
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEscrow(); }, [applicationId]);

  /* ── Auto-release countdown ── */
  const autoReleaseIn = () => {
    if (!escrow?.autoReleaseAt) return null;
    const diff = new Date(escrow.autoReleaseAt) - new Date();
    if (diff <= 0) return "Release imminent";
    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  /* ── Actions ── */
  const call = async (method, endpoint, body = {}) => {
    setBusy(true);
    try {
      const { data } = await axios[method](
        `${API}/api/v1/escrow/${applicationId}/${endpoint}`,
        body,
        { withCredentials: true }
      );
      toast.success(data.message);
      await fetchEscrow();
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateEscrow = async () => {
    if (!agreedAmount || Number(agreedAmount) < 100) {
      return toast.error("Enter a valid amount (min KES 100)");
    }
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${API}/api/v1/escrow/create`,
        { applicationId, agreedAmount: Number(agreedAmount) },
        { withCredentials: true }
      );
      toast.success(data.message);
      await fetchEscrow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitRef  = () => call("put", "mpesa-reference",    { mpesaReference: mpesaRef });
  const handleSubmitWork = () => call("put", "submit-work",        {});
  const handleConfirmCompletion = () => call("put", "confirm-completion", {});
  const handleDispute    = () => call("put", "dispute",            { disputeReason });
  const handleRelease    = () => call("put", "release",            { adminNotes });
  const handleRefund     = () => call("put", "refund",             { adminNotes });
  const handleConfirmPayment = () => call("put", "confirm-payment", {});

  if (loading) return null;

  /* ── Don't show for pending/rejected applications ── */
  if (applicationStatus !== "Accepted" && !escrow) return null;

  const status = escrow?.status || "none";

  return (
    <div className={`escrow ${roleClass}`}>
      <div className="escrow-card">

        {/* ── Header ── */}
        <div className="escrow-card-title">
          💰 Payment & Escrow
          <span className={`escrow-status ${status}`}>
            {STATUS_LABEL[status] || status}
          </span>
        </div>

        {/* ════════════════════════════════════
            NO ESCROW YET — EMPLOYER initiates
        ════════════════════════════════════ */}
        {!escrow && isEmployer && applicationStatus === "Accepted" && (
          <>
            <div className="escrow-alert info">
              You accepted this applicant. Agree on a price in chat, then initiate payment to secure the job.
            </div>
            <input
              className="escrow-input"
              type="number"
              placeholder="Agreed amount (KES)"
              value={agreedAmount}
              onChange={e => setAgreedAmount(e.target.value)}
              min={100}
            />
            <div className="escrow-btn-row">
              <button
                className="escrow-btn escrow-btn-primary"
                onClick={handleCreateEscrow}
                disabled={busy}
              >
                💳 Initiate Payment
              </button>
            </div>
          </>
        )}

        {/* No escrow + seeker */}
        {!escrow && isSeeker && (
          <div className="escrow-alert info">
            Waiting for the employer to initiate payment after you agree on terms.
          </div>
        )}

        {/* ════════════════════════════════════
            ESCROW EXISTS — show details
        ════════════════════════════════════ */}
        {escrow && (
          <>
            {/* Amount breakdown */}
            <div className="escrow-amount-row">
              <div className="escrow-amount-box">
                <div className="escrow-amount-label">Agreed Amount</div>
                <div className="escrow-amount-value">
                  KES {escrow.agreedAmount?.toLocaleString()}
                </div>
              </div>
              <div className="escrow-amount-box">
                <div className="escrow-amount-label">Platform Fee (10%)</div>
                <div className="escrow-amount-value">
                  KES {escrow.platformFee?.toLocaleString()}
                </div>
              </div>
              <div className="escrow-amount-box">
                <div className="escrow-amount-label">Seeker Payout</div>
                <div className="escrow-amount-value accent">
                  KES {escrow.seekerPayout?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="escrow-timeline">
              {TIMELINE_STEPS.map(step => (
                <div className="escrow-timeline-step" key={step.key}>
                  <div className={`escrow-timeline-dot ${getStepState(step.key, status)}`}>
                    {getStepState(step.key, status) === "done"   ? "✓" :
                     getStepState(step.key, status) === "active" ? "●" : "○"}
                  </div>
                  <div className="escrow-timeline-content">
                    <div className="escrow-timeline-label">{step.label}</div>
                    <div className="escrow-timeline-sub">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── PENDING: employer submits M-Pesa ref ── */}
            {status === "pending" && isEmployer && (
              <>
                <div className="escrow-mpesa-box">
                  <div className="escrow-mpesa-title">📱 How to Pay via M-Pesa</div>
                  <div className="escrow-mpesa-step">
                    <span className="escrow-mpesa-num">1</span>
                    Go to M-Pesa → Lipa na M-Pesa → Pay Bill
                  </div>
                  <div className="escrow-mpesa-step">
                    <span className="escrow-mpesa-num">2</span>
                    <span>Business Number: <span className="escrow-mpesa-highlight">247247</span></span>
                  </div>
                  <div className="escrow-mpesa-step">
                    <span className="escrow-mpesa-num">3</span>
                    <span>Account Number: <span className="escrow-mpesa-highlight">APP-{applicationId?.slice(-8).toUpperCase()}</span></span>
                  </div>
                  <div className="escrow-mpesa-step">
                    <span className="escrow-mpesa-num">4</span>
                    <span>Amount: <span className="escrow-mpesa-highlight">KES {escrow.agreedAmount?.toLocaleString()}</span></span>
                  </div>
                  <div className="escrow-mpesa-step">
                    <span className="escrow-mpesa-num">5</span>
                    Enter your M-Pesa PIN and confirm
                  </div>
                </div>
                <input
                  className="escrow-input"
                  placeholder="Enter M-Pesa confirmation code (e.g. RGH7Y8KL2N)"
                  value={mpesaRef}
                  onChange={e => setMpesaRef(e.target.value.toUpperCase())}
                />
                <button
                  className="escrow-btn escrow-btn-primary"
                  onClick={handleSubmitRef}
                  disabled={busy || !mpesaRef.trim()}
                >
                  ✓ I Have Paid — Submit Reference
                </button>
              </>
            )}

            {status === "pending" && isSeeker && (
              <div className="escrow-alert warning">
                Waiting for employer to complete M-Pesa payment. You will be notified once admin confirms receipt.
              </div>
            )}

            {status === "pending" && isAdmin && (
              <>
                <div className="escrow-info-row">
                  <span className="escrow-info-key">M-Pesa Reference</span>
                  <span className="escrow-info-value">
                    {escrow.mpesaReference || "Not submitted yet"}
                  </span>
                </div>
                {escrow.mpesaReference && (
                  <div className="escrow-btn-row">
                    <button
                      className="escrow-btn escrow-btn-primary"
                      onClick={handleConfirmPayment}
                      disabled={busy}
                    >
                      ✓ Confirm Payment Received
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── IN PROGRESS: seeker submits work ── */}
            {status === "in_progress" && (
              <>
                <div className="escrow-alert success">
                  Job is in progress. Funds are securely held until work is confirmed.
                </div>
                {isSeeker && (
                  <div className="escrow-btn-row">
                    <button
                      className="escrow-btn escrow-btn-primary"
                      onClick={handleSubmitWork}
                      disabled={busy}
                    >
                      ✅ Mark Work as Done
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── WORK SUBMITTED: employer confirms ── */}
            {status === "work_submitted" && (
              <>
                <div className="escrow-alert info">
                  The job seeker has marked the work as complete. Please review and confirm.
                </div>
                {isEmployer && (
                  <div className="escrow-btn-row">
                    <button
                      className="escrow-btn escrow-btn-primary"
                      onClick={handleConfirmCompletion}
                      disabled={busy}
                    >
                      ✓ Confirm Work is Done
                    </button>
                    <button
                      className="escrow-btn escrow-btn-ghost"
                      onClick={() => toast("Contact the job seeker via chat to discuss any issues.")}
                    >
                      💬 Discuss in Chat
                    </button>
                  </div>
                )}
                {isSeeker && (
                  <div className="escrow-alert warning">
                    Waiting for employer to confirm your work. This usually takes 1–2 days.
                  </div>
                )}
              </>
            )}

            {/* ── IN PROGRESS without work submitted ── */}
            {status === "in_progress" && isEmployer && (
              <div className="escrow-btn-row">
                <button
                  className="escrow-btn escrow-btn-ghost"
                  onClick={handleConfirmCompletion}
                  disabled={busy}
                >
                  ✓ Confirm Work Done (skip seeker step)
                </button>
              </div>
            )}

            {/* ── COMPLETED: 3-day window ── */}
            {status === "completed" && (
              <>
                <div className="escrow-alert success">
                  Work confirmed! Funds will auto-release in <strong>{autoReleaseIn()}</strong> if no dispute is filed.
                </div>
                {isSeeker && !showDispute && (
                  <div className="escrow-btn-row">
                    <button
                      className="escrow-btn escrow-btn-danger"
                      onClick={() => setShowDispute(true)}
                    >
                      ⚠️ File a Dispute
                    </button>
                  </div>
                )}
                {isSeeker && showDispute && (
                  <>
                    <textarea
                      className="escrow-dispute-textarea"
                      placeholder="Explain why you are disputing (e.g. work was done but payment hasn't been released)..."
                      value={disputeReason}
                      onChange={e => setDisputeReason(e.target.value)}
                    />
                    <div className="escrow-btn-row">
                      <button
                        className="escrow-btn escrow-btn-danger"
                        onClick={handleDispute}
                        disabled={busy || !disputeReason.trim()}
                      >
                        Submit Dispute
                      </button>
                      <button
                        className="escrow-btn escrow-btn-ghost"
                        onClick={() => setShowDispute(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
                {isAdmin && (
                  <>
                    <input
                      className="escrow-input"
                      placeholder="Admin notes (optional)"
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                    />
                    <div className="escrow-btn-row">
                      <button
                        className="escrow-btn escrow-btn-primary"
                        onClick={handleRelease}
                        disabled={busy}
                      >
                        💸 Release Funds to Seeker
                      </button>
                      <button
                        className="escrow-btn escrow-btn-danger"
                        onClick={handleRefund}
                        disabled={busy}
                      >
                        ↩ Refund Employer
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── DISPUTED ── */}
            {status === "disputed" && (
              <>
                <div className="escrow-alert danger">
                  <strong>Dispute filed:</strong> "{escrow.disputeReason}"
                </div>
                {isAdmin && (
                  <>
                    <input
                      className="escrow-input"
                      placeholder="Admin notes / decision reason"
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                    />
                    <div className="escrow-btn-row">
                      <button
                        className="escrow-btn escrow-btn-primary"
                        onClick={handleRelease}
                        disabled={busy}
                      >
                        💸 Release to Seeker (dispute upheld)
                      </button>
                      <button
                        className="escrow-btn escrow-btn-danger"
                        onClick={handleRefund}
                        disabled={busy}
                      >
                        ↩ Refund Employer (dispute rejected)
                      </button>
                    </div>
                  </>
                )}
                {!isAdmin && (
                  <div className="escrow-alert warning">
                    Admin is reviewing this dispute. You will be notified of the outcome.
                  </div>
                )}
              </>
            )}

            {/* ── RELEASED ── */}
            {status === "released" && (
              <div className="escrow-alert success">
                ✅ Funds of <strong>KES {escrow.seekerPayout?.toLocaleString()}</strong> have been released to the job seeker.
                {isAdmin && escrow.releasedAt && (
                  <span> Released on {new Date(escrow.releasedAt).toLocaleDateString("en-GB")}.</span>
                )}
              </div>
            )}

            {/* ── REFUNDED ── */}
            {status === "refunded" && (
              <div className="escrow-alert warning">
                ↩ <strong>KES {escrow.agreedAmount?.toLocaleString()}</strong> has been refunded to the employer.
              </div>
            )}

            {/* ── Transfer reminder for admin ── */}
            {isAdmin && status === "released" && (
              <div className="escrow-info-row">
                <span className="escrow-info-key">Transfer to seeker</span>
                <span className="escrow-info-value">
                  {escrow.seekerId?.name} · {escrow.seekerId?.phone}
                </span>
              </div>
            )}
            {isAdmin && status === "refunded" && (
              <div className="escrow-info-row">
                <span className="escrow-info-key">Refund to employer</span>
                <span className="escrow-info-value">
                  {escrow.employerId?.name} · {escrow.employerId?.phone}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EscrowPanel;
