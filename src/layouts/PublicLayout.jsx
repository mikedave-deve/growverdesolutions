import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X, Phone, MapPin, Mail, ShieldAlert, Linkedin, Twitter, Facebook } from "lucide-react";
import { ROUTES } from "../constants/routes.js";
import { Logo } from "../components/brand/Logo.jsx";

const LINKS = [
  { to: ROUTES.HOME, label: "Home" },
  { to: ROUTES.ABOUT, label: "About Company" },
  { to: ROUTES.TEAM, label: "Our Team" },
  { to: ROUTES.JOBS, label: "Browse Jobs" },
  { to: ROUTES.RESUME, label: "Submit Resume" },
];

const CONSENT_KEY = "gv_cookie_consent";

function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function decide(value) {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie and safety notice">
      <div className="cookie-banner-text">
        <div className="cookie-banner-icon"><ShieldAlert size={20} /></div>
        <div>
          <p>We use cookies to keep you signed in and to understand how the site is used. You can accept or reject non-essential cookies at any time.</p>
          <p><strong>Protect yourself from scams:</strong> Growverde Solutions will never ask candidates to pay money, provide banking details for a "deposit," or purchase gift cards as part of a job offer or onboarding. If someone claiming to represent us asks for payment, it is not us — please report it.</p>
        </div>
      </div>
      <div className="cookie-actions">
        <button type="button" className="cancel" onClick={() => setVisible(false)}>Cancel</button>
        <button type="button" className="reject" onClick={() => decide("rejected")}>Reject</button>
        <button type="button" className="accept" onClick={() => decide("accepted")}>Accept</button>
      </div>
    </div>
  );
}

// The public marketing site for Growverde Solutions. Everything here
// renders inside a .gv-public wrapper so styles/public-site.css can
// safely use plain class selectors without leaking into the employee
// portal's Tailwind design system.
export function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="gv-public">
      <div className="topbar">
        <div className="wrap">
          <div className="topbar-contact">
            <span><MapPin /> 480 Congress Ave, Suite 300, Austin, TX 78701</span>
            <a href="tel:+15125550148"><Phone /> +1 (512) 555-0148</a>
            <a href="tel:+15125550192"><Phone /> +1 (512) 555-0192</a>
          </div>
          <div className="topbar-contact">
            <span>Mon – Fri: 8:30am – 6:00pm</span>
            <a href="mailto:hello@growverdesolutions.com"><Mail /> hello@growverdesolutions.com</a>
          </div>
        </div>
      </div>

      <header className="site">
        <div className="wrap nav">
          <Link to={ROUTES.HOME} className="logo" style={{ gap: 10 }}>
            <Logo />
          </Link>
          <nav className="navlinks">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === ROUTES.HOME} className={({ isActive }) => (isActive ? "active" : "")}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-cta">
            <Link to={ROUTES.LOGIN} className="btn btn-outline btn-sm">Employee Login</Link>
            <Link to={ROUTES.JOBS} className="btn btn-gold btn-sm">Browse Jobs</Link>
            <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <div className={`mobilemenu${open ? " open" : ""}`}>
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <Link to={ROUTES.LOGIN} onClick={() => setOpen(false)} className="btn btn-outline btn-sm">Employee Login</Link>
            <Link to={ROUTES.REGISTER} onClick={() => setOpen(false)} className="btn btn-outline btn-sm">Register Account</Link>
            <Link to={ROUTES.JOBS} onClick={() => setOpen(false)} className="btn btn-gold btn-sm">Browse Jobs</Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="logo" style={{ color: "#fff", marginBottom: 16, gap: 10 }}>
                <Logo tone="light" />
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
                Passionate recruiters and HR technologists who leverage industry knowledge and a wide network to align talented people with the right career.
              </p>
              <div className="social-row" style={{ marginTop: 20 }}>
                <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn"><Linkedin size={15} /></a>
                <a href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter"><Twitter size={15} /></a>
                <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook"><Facebook size={15} /></a>
              </div>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li><Link to={ROUTES.HOME}>Home</Link></li>
                <li><Link to={ROUTES.ABOUT}>About Us</Link></li>
                <li><Link to={ROUTES.TEAM}>Our Team</Link></li>
              </ul>
            </div>
            <div>
              <h5>Quick Links</h5>
              <ul>
                <li><Link to={ROUTES.RESUME}>Submit Resume</Link></li>
                <li><Link to={ROUTES.LOGIN}>Employee Login</Link></li>
                <li><Link to={ROUTES.JOBS}>Search Jobs</Link></li>
                <li><Link to={ROUTES.REGISTER}>Register Account</Link></li>
              </ul>
            </div>
            <div>
              <h5>Contact</h5>
              <div className="footer-contact">
                <div><MapPin /><span>480 Congress Ave, Suite 300<br />Austin, TX 78701</span></div>
                <div><Phone /><a href="tel:+15125550148">+1 (512) 555-0148</a></div>
                <div><Phone /><a href="tel:+15125550192">+1 (512) 555-0192</a></div>
                <div><Mail /><a href="mailto:hello@growverdesolutions.com">hello@growverdesolutions.com</a></div>
              </div>
            </div>
            <div>
              <h5>Subscribe</h5>
              <p style={{ fontSize: 14 }}>Our conversation is just getting started.</p>
              <div className="subscribe-row">
                <input type="email" placeholder="Your email address" />
                <button type="button">Join</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Growverde Solutions. All rights reserved.</span>
            <span>Terms &amp; Conditions · Privacy Policy</span>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
    </div>
  );
}
