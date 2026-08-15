import React from "react";
import { Link } from "react-router-dom";
import { Clock3, HeartHandshake, Sparkles, Users2 } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { PhotoImage } from "../../components/public/PhotoImage.jsx";
import { Counter } from "../../components/public/Counter.jsx";
import headquartersPhoto from "../../assets/images/office/headquarters.jpg";

const VALUES = [
  { title: "Honesty First", body: "Transparent timelines and real feedback, even when it's not what you want to hear.", icon: Clock3 },
  { title: "Genuine Care", body: "We treat every placement like it's the only one we're working on.", icon: HeartHandshake },
  { title: "Speed with Care", body: "Fast doesn't mean careless — we move quickly without cutting corners.", icon: Sparkles },
  { title: "Inclusive by Design", body: "Every candidate gets a fair, consistent process regardless of background.", icon: Users2 },
];

const TIMELINE = [
  { yr: "2014", title: "Growverde Solutions founded", body: "Started as a two-person healthcare staffing desk in Austin, TX." },
  { yr: "2018", title: "Expanded into tech & finance", body: "Grew into technology, accounting, and financial services recruiting." },
  { yr: "2022", title: "1,000th placement", body: "Crossed 1,000 successful placements across our client network." },
  { yr: "2026", title: "340+ client companies", body: "Now partnering with organizations nationwide across six practice areas." },
];

export function About() {
  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-ring" />
        <div className="wrap">
          <p className="crumb"><b>Home</b> / About Company</p>
          <p className="eyebrow" style={{ color: "var(--gold)" }}>Who We Are</p>
          <h1>About Growverde Solutions</h1>
          <p>We've spent over a decade building the connective tissue between great people and great companies.</p>
        </div>
      </section>

      <section>
        <div className="wrap about-split">
          <div className="about-media">
            <PhotoImage variant="dark" src={headquartersPhoto} alt="Growverde Solutions headquarters" />
          </div>
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 style={{ fontSize: 30, margin: "12px 0 18px" }}>Every great career starts with someone who believes in you first</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75 }}>
              Growverde Solutions began with a two-person healthcare desk in Austin and a conviction that has never changed: behind every resume is a person with a story, and behind every open role is a team hoping the next hire is the one who finally fits. We started this company to be the bridge between those two moments of hope.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75, marginTop: 14 }}>
              More than a decade later, that founding belief still drives everything we do. We've sat with nurses nervous about their first ICU role, with engineers taking a leap into a company they'd only dreamed of, with hiring managers under pressure to build a team that can carry their mission forward — and every single time, our job has been the same: to see the whole person, not just the credentials, and to match them with a place where they can actually thrive.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75, marginTop: 14 }}>
              Today, that same philosophy scales across healthcare, technology, finance, legal, marketing, and HR — but the mission hasn't gotten any smaller. Every placement is still one person, one opportunity, one fresh start. We built Growverde Solutions to make sure that moment gets the care it deserves, every time.
            </p>
            <Link to={ROUTES.TEAM} className="btn btn-primary" style={{ marginTop: 22 }}>Meet the Team</Link>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="wrap stats-grid">
          <div className="stat-block"><div className="num"><Counter value={1854} suffix="+" /></div><div className="lbl">Placements Completed</div></div>
          <div className="stat-block"><div className="num"><Counter value={12} suffix="+" /></div><div className="lbl">Years in Business</div></div>
          <div className="stat-block"><div className="num"><Counter value={340} suffix="+" /></div><div className="lbl">Client Companies</div></div>
          <div className="stat-block"><div className="num"><Counter value={98} suffix="%" /></div><div className="lbl">Client Satisfaction</div></div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            <p className="eyebrow" style={{ justifyContent: "center" }}>What Drives Us</p>
            <h2>Our values</h2>
          </div>
          <div className="grid g4">
            {VALUES.map((v) => (
              <div className="card value-card" key={v.title}>
                <div className="service-icon"><v.icon size={20} /></div>
                <h3 style={{ fontSize: 16.5 }}>{v.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 8 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--white)" }}>
        <div className="wrap">
          <div className="section-head" style={{ margin: "0 auto 10px", textAlign: "center" }}>
            <p className="eyebrow" style={{ justifyContent: "center" }}>Our Journey</p>
            <h2>Milestones</h2>
          </div>
          <div className="timeline" style={{ maxWidth: 700, margin: "20px auto 0" }}>
            {TIMELINE.map((t) => (
              <div className="timeline-item" key={t.yr}>
                <div className="yr">{t.yr}</div>
                <div><h4>{t.title}</h4><p>{t.body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta-banner">
            <h2>Let's build your team, or find your next role.</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <Link to={ROUTES.JOBS} className="btn btn-gold">Browse Jobs</Link>
              <Link to={ROUTES.RESUME} className="btn btn-outline-light">Submit Resume</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
