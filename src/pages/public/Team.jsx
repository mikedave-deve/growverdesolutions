import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, Mail } from "lucide-react";
import { SEO } from "../../components/seo/SEO.jsx";
import { ROUTES } from "../../constants/routes.js";
import { PhotoImage } from "../../components/public/PhotoImage.jsx";
import { TEAM, LEADERSHIP } from "../../data/publicSiteData.js";

function TeamCard({ t }) {
  return (
    <div className="card team-card">
      <PhotoImage variant="dark" src={t.img} alt={t.name} label={t.initials} className="team-photo" />
      <div className="team-info">
        <b>{t.name}</b>
        <span>{t.role}</span>
        <p>{t.bio}</p>
        <div className="team-social">
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn"><Linkedin size={13} /></a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Email"><Mail size={13} /></a>
        </div>
      </div>
    </div>
  );
}

export function Team() {
  return (
    <div>
      <SEO
        title="Meet Our Team"
        description="Meet the recruiters, researchers, and client partners behind Growverde Solutions — deep industry knowledge across healthcare, tech, finance, legal, marketing, and HR."
        path={ROUTES.TEAM}
      />
      <section className="page-hero">
        <div className="page-hero-ring" />
        <div className="wrap">
          <p className="crumb"><b>Home</b> / Our Team</p>
          <p className="eyebrow" style={{ color: "var(--gold)" }}>The People Behind Growverde Solutions</p>
          <h1>Meet Our Team</h1>
          <p>Recruiters, researchers, and client partners who bring deep industry knowledge to every search.</p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="team-grid">
            {[...LEADERSHIP, ...TEAM].map((t) => <TeamCard t={t} key={t.name} />)}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--white)" }}>
        <div className="wrap">
          <div className="cta-banner" style={{ background: "var(--surface)" }}>
            <h2>Want to work with our team?</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <Link to={ROUTES.RESUME} className="btn btn-gold">Submit Your Resume</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
