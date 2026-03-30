import React, { useState, useContext } from "react";
import { Context } from "../../main";
import "./PremiumGate.css";

const FEATURES = {
  "Employer": [
    { icon: "💬", text: "In-app chat with applicants" },
    { icon: "📞", text: "View applicant contact details" },
    { icon: "⚡", text: "Priority job listing visibility" },
    { icon: "🔒", text: "Secure escrow payments" },
  ],
  "Job Seeker": [
    { icon: "💬", text: "In-app chat with employers" },
    { icon: "📞", text: "View employer phone & email" },
    { icon: "✅", text: "Verified applicant badge" },
    { icon: "🔒", text: "Payment protection guarantee" },
  ],
};

/* ════════════════════════════════════════
   PREMIUM MODAL
   Shows when any gated feature is clicked
════════════════════════════════════════ */
export const PremiumModal = ({ onClose }) => {
  const { user } = useContext(Context);
  const role      = user?.role || "Job Seeker";
  const roleClass = role === "Employer" ? "employer" : "seeker";
  const features  = FEATURES[role] || FEATURES["Job Seeker"];

  return (
    <div className="pg-backdrop" onClick={onClose}>
      <div
        className={`pg-modal ${roleClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pg-close" onClick={onClose}>✕</button>

        <span className="pg-crown">👑</span>

        <h2 className="pg-modal-title">Unlock Premium Access</h2>
        <p className="pg-modal-sub">
          {role === "Employer"
            ? "Chat with applicants, view their contact info, and manage hirings securely — all in one place."
            : "Chat directly with employers, see their contact details, and get payment protection on every job."}
        </p>

        <ul className="pg-features">
          {features.map((f, i) => (
            <li className="pg-feature" key={i}>
              <span className="pg-feature-icon">{f.icon}</span>
              {f.text}
            </li>
          ))}
        </ul>

        <div className="pg-divider" />

        <div className="pg-price-row">
          <span className="pg-price-label">Monthly Plan</span>
          <span className="pg-price">
            Coming Soon
          </span>
        </div>

        <button
          className="pg-cta"
          onClick={() => {
            // TODO: wire to payment page when ready
            onClose();
            alert("Premium payments coming soon! Contact admin to get early access.");
          }}
        >
          Upgrade to Premium →
        </button>

        <p className="pg-modal-note">
          Cancel anytime · Secure payment · KES billing
        </p>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   LOCKED CONTACT FIELD
   Use instead of showing phone/email to free users.
   <LockedContact label="0712 345 678" />
════════════════════════════════════════ */
export const LockedContact = ({ label = "View contact" }) => {
  const { user }  = useContext(Context);
  const [show, setShow] = useState(false);
  const roleClass = user?.role === "Employer" ? "employer" : "seeker";

  return (
    <>
      <span
        className={`pg-locked-field ${roleClass}`}
        onClick={() => setShow(true)}
        title="Premium feature"
      >
        <span className="pg-lock-icon">🔒</span>
        {label}
      </span>
      {show && <PremiumModal onClose={() => setShow(false)} />}
    </>
  );
};

/* ════════════════════════════════════════
   BLUR WRAP
   Wraps any element (e.g. a button) with a blur + lock badge.
   <BlurGate><button>Message</button></BlurGate>
════════════════════════════════════════ */
export const BlurGate = ({ children }) => {
  const { user }  = useContext(Context);
  const [show, setShow] = useState(false);
  const roleClass = user?.role === "Employer" ? "employer" : "seeker";

  return (
    <>
      <div className="pg-blur-wrap" onClick={() => setShow(true)}>
        <div className="pg-blur-content">{children}</div>
        <div className="pg-blur-overlay">
          <span className={`pg-blur-badge ${roleClass}`}>
            🔒 Premium
          </span>
        </div>
      </div>
      {show && <PremiumModal onClose={() => setShow(false)} />}
    </>
  );
};

/* ════════════════════════════════════════
   usePremiumGate hook
   Use in any component to check premium status
   and show the modal on demand.

   const { isPremium, gate, Modal } = usePremiumGate();
   <button onClick={() => gate(doSomething)}>Chat</button>
   {Modal}
════════════════════════════════════════ */
export const usePremiumGate = () => {
  const { user }        = useContext(Context);
  const [show, setShow] = useState(false);

  const isPremium =
    user?.role === "Admin" ||
    (user?.isPremium &&
      (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date()));

  // gate(fn) — if premium runs fn, else shows modal
  const gate = (fn) => {
    if (isPremium) {
      fn?.();
    } else {
      setShow(true);
    }
  };

  const Modal = show ? <PremiumModal onClose={() => setShow(false)} /> : null;

  return { isPremium, gate, Modal, showModal: () => setShow(true) };
};

export default PremiumModal;
