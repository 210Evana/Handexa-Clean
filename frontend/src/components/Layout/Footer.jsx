import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube, FaHeart } from "react-icons/fa";

const Footer = () => {
  const { isAuthorized, user } = useContext(Context);
  if (!isAuthorized) return null;

  const isEmployer = user?.role === "Employer";
  const isJobSeeker = user?.role === "Job Seeker";

  /* ── theme tokens ── */
  const employerTheme = {
    bg: "#060b18",
    border: "rgba(163,230,53,.1)",
    logoA: "#fff", logoB: "#a3e635",
    accent: "#a3e635",
    tagline: "rgba(232,234,242,.4)",
    colHead: "rgba(232,234,242,.9)",
    linkColor: "rgba(232,234,242,.5)",
    linkHover: "#a3e635",
    divider: "rgba(255,255,255,.06)",
    copy: "rgba(232,234,242,.35)",
    iconBg: "rgba(163,230,53,.08)",
    iconBorder: "rgba(163,230,53,.15)",
    iconColor: "rgba(232,234,242,.5)",
    iconHoverBg: "#a3e635",
    iconHoverColor: "#060b18",
    heartColor: "#a3e635",
    font: "'DM Sans', sans-serif",
  };

  const seekerTheme = {
    bg: "#110d09",
    border: "rgba(224,123,79,.1)",
    logoA: "#faf7f2", logoB: "#e07b4f",
    accent: "#e07b4f",
    tagline: "rgba(250,247,242,.35)",
    colHead: "rgba(250,247,242,.85)",
    linkColor: "rgba(250,247,242,.45)",
    linkHover: "#e07b4f",
    divider: "rgba(255,255,255,.06)",
    copy: "rgba(250,247,242,.3)",
    iconBg: "rgba(224,123,79,.08)",
    iconBorder: "rgba(224,123,79,.15)",
    iconColor: "rgba(250,247,242,.5)",
    iconHoverBg: "#e07b4f",
    iconHoverColor: "#fff",
    heartColor: "#e07b4f",
    font: "'Outfit', sans-serif",
  };

  const adminTheme = {
    bg: "#0f172a",
    border: "rgba(255,255,255,.06)",
    logoA: "#fff", logoB: "#818cf8",
    accent: "#818cf8",
    tagline: "rgba(255,255,255,.35)",
    colHead: "rgba(255,255,255,.8)",
    linkColor: "rgba(255,255,255,.4)",
    linkHover: "#818cf8",
    divider: "rgba(255,255,255,.06)",
    copy: "rgba(255,255,255,.3)",
    iconBg: "rgba(129,140,248,.08)",
    iconBorder: "rgba(129,140,248,.15)",
    iconColor: "rgba(255,255,255,.5)",
    iconHoverBg: "#818cf8",
    iconHoverColor: "#fff",
    heartColor: "#818cf8",
    font: "'DM Sans', sans-serif",
  };

  const t = user?.role === "Admin" ? adminTheme : isEmployer ? employerTheme : seekerTheme;

  const employerLinks = {
    Platform: [
      { label: "Post a Job", to: "/job/post" },
      { label: "My Posted Jobs", to: "/job/me" },
      { label: "View Applications", to: "/applications/me" },
      { label: "Browse Workers", to: "/job/getall" },
    ],
    Account: [
      { label: "Edit Profile", to: "/profile" },
      { label: "Dashboard", to: "/" },
    ],
  };

  const seekerLinks = {
    "Find Work": [
      { label: "Browse All Jobs", to: "/job/getall" },
      { label: "My Applications", to: "/applications/me" },
    ],
    Account: [
      { label: "Edit Profile", to: "/profile" },
      { label: "Home", to: "/" },
    ],
  };

  const linkGroups = isEmployer ? employerLinks : seekerLinks;

  const socials = [
    { icon: <FaFacebookF />, href: "https://www.facebook.com/profile.php?id=10909997", label: "Facebook" },
    { icon: <FaYoutube />, href: "https://www.youtube.com/@FunWithYvanna", label: "YouTube" },
    { icon: <FaLinkedinIn />, href: "https://www.linkedin.com/", label: "LinkedIn" },
    { icon: <FaInstagram />, href: "https://www.instagram.com/evea_nnahjuma/", label: "Instagram" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=Outfit:wght@300;400;500&display=swap');

        .hx-footer {
          background: ${t.bg};
          border-top: 1px solid ${t.border};
          font-family: ${t.font};
        }
        .hx-footer-main {
          max-width: 1280px; margin: 0 auto;
          padding: 64px 32px 48px;
          display: grid;
          grid-template-columns: 1.8fr repeat(2, 1fr) 1.2fr;
          gap: 48px;
        }
        /* brand col */
        .hxf-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem; letter-spacing: .06em;
          text-decoration: none; display: inline-block; margin-bottom: 12px;
        }
        .hxf-la { color: ${t.logoA}; }
        .hxf-lb { color: ${t.logoB}; }
        .hxf-tagline {
          font-size: .875rem; line-height: 1.7;
          color: ${t.tagline}; max-width: 240px; margin-bottom: 28px;
        }
        .hxf-socials { display: flex; gap: 10px; }
        .hxf-social {
          width: 36px; height: 36px; border-radius: 8px;
          background: ${t.iconBg}; border: 1px solid ${t.iconBorder};
          color: ${t.iconColor}; display: flex; align-items: center;
          justify-content: center; font-size: 14px; text-decoration: none;
          transition: background .2s, color .2s, border-color .2s;
        }
        .hxf-social:hover {
          background: ${t.iconHoverBg};
          color: ${t.iconHoverColor};
          border-color: ${t.iconHoverBg};
        }
        /* link cols */
        .hxf-col h4 {
          font-size: .7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .15em;
          color: ${t.colHead}; margin: 0 0 18px;
        }
        .hxf-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .hxf-col ul li a {
          font-size: .875rem; color: ${t.linkColor};
          text-decoration: none; transition: color .2s;
        }
        .hxf-col ul li a:hover { color: ${t.linkHover}; }

        /* badge col */
        .hxf-badge-col { display: flex; flex-direction: column; gap: 12px; }
        .hxf-badge {
          background: ${t.iconBg};
          border: 1px solid ${t.iconBorder};
          border-radius: 10px; padding: 14px 16px;
        }
        .hxf-badge-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem; color: ${t.accent}; line-height: 1;
        }
        .hxf-badge-lbl { font-size: .78rem; color: ${t.tagline}; margin-top: 2px; }

        /* bottom bar */
        .hx-footer-bar {
          border-top: 1px solid ${t.divider};
          max-width: 1280px; margin: 0 auto;
          padding: 20px 32px;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .hxf-copy {
          font-size: .8rem; color: ${t.copy};
          display: flex; align-items: center; gap: 6px;
        }
        .hxf-heart { color: ${t.heartColor}; font-size: 12px; }
        .hxf-bar-links { display: flex; gap: 20px; }
        .hxf-bar-links a {
          font-size: .78rem; color: ${t.copy};
          text-decoration: none; transition: color .2s;
        }
        .hxf-bar-links a:hover { color: ${t.accent}; }

        @media (max-width: 1024px) {
          .hx-footer-main { grid-template-columns: 1fr 1fr; }
          .hxf-badge-col { flex-direction: row; flex-wrap: wrap; }
          .hxf-badge { flex: 1; min-width: 120px; }
        }
        @media (max-width: 600px) {
          .hx-footer-main { grid-template-columns: 1fr; padding: 40px 20px 32px; gap: 32px; }
          .hx-footer-bar { padding: 16px 20px; }
          .hxf-bar-links { display: none; }
        }
      `}</style>

      <footer className="hx-footer">
        <div className="hx-footer-main">
          {/* Brand */}
          <div>
            <Link to="/" className="hxf-logo">
              <span className="hxf-la">Hand</span><span className="hxf-lb">Exa</span>
            </Link>
            <p className="hxf-tagline">
              {isEmployer
                ? "Kenya's fastest way to hire skilled informal workers across all 47 counties."
                : "Find fair work, build your career, and connect with employers who value your skills."}
            </p>
            <div className="hxf-socials">
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hxf-social" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(linkGroups).map(([heading, links]) => (
            <div className="hxf-col" key={heading}>
              <h4>{heading}</h4>
              <ul>
                {links.map(l => (
                  <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}

          {/* Stats badges */}
          <div className="hxf-badge-col">
            {(isEmployer ? [
              { n: "12K+", l: "Skilled Workers" },
              { n: "47", l: "Counties" },
              { n: "48h", l: "Avg. Hire Time" },
            ] : [
              { n: "5K+", l: "Open Jobs" },
              { n: "Free", l: "Always Free" },
              { n: "47", l: "Counties" },
            ]).map(b => (
              <div className="hxf-badge" key={b.l}>
                <div className="hxf-badge-num">{b.n}</div>
                <div className="hxf-badge-lbl">{b.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hx-footer-bar">
          <p className="hxf-copy">
            © {new Date().getFullYear()} HandExa. Made with <FaHeart className="hxf-heart" /> by Yvanna
          </p>
          <div className="hxf-bar-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
