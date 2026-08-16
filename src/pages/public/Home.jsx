import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, CheckCircle2, ShieldCheck, ArrowUpRight, Layers, MousePointerClick, HeartHandshake, Clock3, Award } from "lucide-react";
import { SEO } from "../../components/seo/SEO.jsx";
import { ROUTES } from "../../constants/routes.js";
import { PhotoImage } from "../../components/public/PhotoImage.jsx";
import { Marquee, LogoChip, Pill } from "../../components/public/Marquee.jsx";
import { Counter } from "../../components/public/Counter.jsx";
import { CLIENT_LOGOS, SPECIALTY_TAGS_1, SPECIALTY_TAGS_2, TESTIMONIALS, INSIGHTS } from "../../data/publicSiteData.js";
import heroPhoto from "../../assets/images/office/hero-formal.jpg";
import galleryCollaboratingPhoto from "../../assets/images/office/gallery-team1.jpg";
import galleryMeetingPhoto from "../../assets/images/office/gallery-team2.jpg";
import galleryInterviewPhoto from "../../assets/images/office/gallery-team3.jpg";
import aboutOfficePhoto from "../../assets/images/office/about-office-formal.jpg";
import expertiseHealthcarePhoto from "../../assets/images/office/expertise-healthcare.jpg";
import expertiseMarketingPhoto from "../../assets/images/office/expertise-marketing.jpg";
import expertiseHrPhoto from "../../assets/images/office/expertise-hr.jpg";
import expertiseFinancePhoto from "../../assets/images/office/expertise-finance.jpg";
import portfolioLegalPhoto from "../../assets/images/office/portfolio-legal.jpg";
import portfolioItPhoto from "../../assets/images/office/portfolio-it.jpg";
import portfolioAccountingPhoto from "../../assets/images/office/portfolio-accounting.jpg";
import portfolioStrategyPhoto from "../../assets/images/office/portfolio-strategy.jpg";
import avatarJmPhoto from "../../assets/images/office/team-daniel.jpg";
import avatarRkPhoto from "../../assets/images/office/team-marcus.jpg";
import avatarTsPhoto from "../../assets/images/office/team-sofia.jpg";
import avatarAlPhoto from "../../assets/images/office/team-owen.jpg";

const SERVICES = [
  {
    key: "trusted",
    icon: Layers,
    title: "Trusted Relationships",
    body: "We connect with top market talent every day, building networks that stay strong long after the placement is made.",
    writeup: [
      "Every placement we make is the start of a relationship, not the end of a transaction. Our recruiters stay in touch with both clients and candidates long after an offer is signed — checking in at 30, 60, and 90 days to make sure the fit is really working.",
      "That ongoing contact is why so much of our business comes from repeat clients and referrals. When a hiring manager knows a recruiter will still pick up the phone six months later, they trust that recruiter's next recommendation without hesitation.",
      "The same goes for candidates. We've placed people who came back to us years later for their next move, and referred former colleagues along the way — because the relationship never ended when the paperwork was signed.",
    ],
  },
  {
    key: "expertise",
    icon: ArrowUpRight,
    title: "Proven Expertise",
    body: "Deep market knowledge, disciplined process, and modern tooling give you immediate access to exceptional candidates.",
    writeup: [
      "Our recruiters specialize by industry — healthcare, technology, finance, legal, marketing, and HR — so every search is run by someone who already understands the role, the market rate, and what a strong candidate actually looks like in that field.",
      "That specialization is backed by a disciplined process: structured intake calls, targeted sourcing, and a rigorous screening process before a single resume ever reaches a client's desk.",
      "The result is speed without shortcuts. Clients get a shortlist of genuinely qualified candidates fast, because the groundwork was done right the first time.",
    ],
  },
  {
    key: "end-to-end",
    icon: MousePointerClick,
    title: "End-to-End Solutions",
    body: "From first search to signed offer, our comprehensive service is built for clients who want one seamless partner.",
    writeup: [
      "We handle the entire hiring journey — sourcing, screening, interview coordination, offer negotiation, and onboarding support — so our clients aren't juggling multiple vendors for one open role.",
      "For candidates, that means a single point of contact who can answer questions about the role, the company, and the process at every stage, instead of being passed between departments.",
      "Whether you're filling one critical role or building out an entire team, our end-to-end approach means fewer handoffs, faster decisions, and a better experience for everyone involved.",
    ],
  },
];

const EXPERTISE = [
  { title: "Healthcare + Life Sciences", body: "A commitment to honesty, ethics, and transparency in every placement.", img: expertiseHealthcarePhoto },
  { title: "Marketing & Sales", body: "Pushing creativity and constant improvement for growth-stage teams.", img: expertiseMarketingPhoto },
  { title: "Human Resources", body: "Understanding and meeting the needs of the people behind the org chart.", img: expertiseHrPhoto },
  { title: "Financial Services", body: "Creating diverse, inclusive workplaces built to last.", img: expertiseFinancePhoto },
];

const EMPLOYEE_CARE = [
  { icon: HeartHandshake, title: "A Recruiter Who Answers", body: "You'll always have a direct point of contact — no ticket queues, no getting passed around." },
  { icon: ShieldCheck, title: "Vetted, Verified Clients", body: "We only place candidates with client companies we've personally vetted for fair, legitimate work." },
  { icon: Clock3, title: "Honest Timelines", body: "We tell you where things stand, even when the answer is 'still waiting' — no ghosting, ever." },
  { icon: Award, title: "Support After You're Hired", body: "Our relationship doesn't end at the offer letter. We check in through your first 90 days on the job." },
];

const PORTFOLIO = [
  { label: "Legal Support", img: portfolioLegalPhoto },
  { label: "Information Technology", img: portfolioItPhoto },
  { label: "Accounting + Finance", img: portfolioAccountingPhoto },
  { label: "Strategy Development", img: portfolioStrategyPhoto },
];

function TestimonialCarousel() {
  const [i, setI] = useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);
  const t = TESTIMONIALS[i];
  return (
    <div className="testi-wrap">
      <div className="testi-slide active" key={i}>
        <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
        <div className="testi-person">
          <img className="testi-avatar" src={t.img} alt={t.name} style={{ objectFit: "cover" }} />
          <div><b>{t.name}</b><span>{t.role}</span></div>
        </div>
      </div>
      <div className="testi-dots">
        {TESTIMONIALS.map((_, idx) => (
          <button key={idx} className={idx === i ? "active" : ""} onClick={() => setI(idx)} aria-label={`Testimonial ${idx + 1}`} />
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);

  return (
    <div>
      <SEO
        title="Staffing & Recruitment Agency"
        description="Growverde Solutions pairs ambitious professionals with organizations that need them — staffing and recruiting across healthcare, technology, finance, legal, marketing, and HR."
        path={ROUTES.HOME}
        image={heroPhoto}
      />
      <section className="hero">
        <div className="wrap-wide hero-grid">
          <div>
            <div className="hero-social-proof">
              <div className="avatar-stack">
                <img className="av" src={avatarJmPhoto} alt="" />
                <img className="av" src={avatarRkPhoto} alt="" />
                <img className="av" src={avatarTsPhoto} alt="" />
                <img className="av" src={avatarAlPhoto} alt="" />
              </div>
              <div className="plus">+45</div>
              <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 220 }}>Whether hiring or job-hunting, we're here to help.</p>
            </div>
            <p className="eyebrow">Staffing &amp; Recruitment Partners</p>
            <h1>Creating connections<br />is what we do best.</h1>
            <p className="lead">Growverde Solutions pairs ambitious professionals with organizations that need them — across healthcare, technology, finance, and beyond.</p>
            <div className="hero-ctas">
              <Link to={ROUTES.JOBS} className="btn btn-gold">Browse Open Jobs</Link>
              <Link to={ROUTES.RESUME} className="btn btn-outline">Submit Your Resume</Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="stat-num"><Counter value={198} suffix="+" /></div>
                <div className="stat-label">Employment Testimonials</div>
              </div>
              <div>
                <div className="stat-num"><Counter value={378} suffix="+" /></div>
                <div className="stat-label">Unique Jobs Live</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <PhotoImage variant="dark" src={heroPhoto} alt="Growverde Solutions team collaborating in the office" className="ph-main" />
            <div className="hero-float f1">
              <div className="ficon"><CheckCircle2 size={18} /></div>
              <div><b>1,854+</b><span>Placements completed</span></div>
            </div>
            <div className="hero-float f2">
              <div className="ficon"><ShieldCheck size={18} /></div>
              <div><b>98%</b><span>Client satisfaction</span></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "36px 0" }}>
        <div className="wrap-wide">
          <p style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 22 }}>
            Trusted by hiring teams at
          </p>
          <Marquee items={CLIENT_LOGOS} renderItem={(l) => <LogoChip>{l}</LogoChip>} />
        </div>
      </section>

      <section style={{ padding: 0 }}>
        <div className="gallery-band">
          <PhotoImage variant="dark" src={galleryCollaboratingPhoto} alt="Team collaborating" />
          <PhotoImage variant="gold" src={galleryMeetingPhoto} alt="Client meeting" />
          <PhotoImage src={galleryInterviewPhoto} alt="Candidate interview" />
        </div>
      </section>

      <section>
        <div className="wrap-wide grid g3">
          {SERVICES.map((s) => (
            <button type="button" className="card service-card" key={s.key} onClick={() => setActiveService(s)}>
              <div className="service-icon"><s.icon size={22} /></div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="more">Explore More →</span>
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--white)" }}>
        <div className="wrap-wide about-split">
          <div className="about-media">
            <PhotoImage variant="gold" src={aboutOfficePhoto} alt="Growverde Solutions office" />
            <div className="about-counter">
              <div className="num"><Counter value={1854} suffix="+" /></div>
              <div className="lbl">Projects Successfully Completed</div>
            </div>
          </div>
          <div>
            <p className="eyebrow">Choose The Best</p>
            <h2 style={{ fontSize: 32, margin: "12px 0 18px" }}>We achieve growth through collaboration</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
              Choosing the right staffing partner matters. Our recruiters take the time to understand not just a job description, but the team, culture, and goals behind it — for candidates and clients alike.
            </p>
            <div className="about-points">
              <div className="about-point">
                <div className="bullet">01</div>
                <div><b>Your Strategic Partner</b><span>Experienced recruiters who understand what makes a team thrive.</span></div>
              </div>
              <div className="about-point">
                <div className="bullet">02</div>
                <div><b>Making Career Dreams a Reality</b><span>Connecting people to careers they're genuinely excited about.</span></div>
              </div>
            </div>
            <Link to={ROUTES.ABOUT} className="btn btn-primary">Learn More About Us</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap-wide">
          <div className="section-head">
            <p className="eyebrow">Explore Our Practice Areas</p>
            <h2>Exceptional service for candidates and clients, across every industry we serve.</h2>
          </div>
          <div className="expertise-row">
            {EXPERTISE.map((e, i) => (
              <Link to={ROUTES.JOBS} className="expertise-item" key={e.title}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <PhotoImage src={e.img} alt={e.title} className="thumb" style={{ borderRadius: "50%" }} />
                <div><h4>{e.title}</h4><p>{e.body}</p></div>
                <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--surface)", padding: "56px 0" }}>
        <div className="wrap-wide">
          <p style={{ textAlign: "center", color: "rgba(255,255,255,.5)", fontSize: 12.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 20 }}>
            What We Specialize In
          </p>
        </div>
        <Marquee items={SPECIALTY_TAGS_1} renderItem={(t) => <Pill>{t}</Pill>} />
        <div style={{ marginTop: 14 }}>
          <Marquee items={SPECIALTY_TAGS_2} reverse renderItem={(t) => <Pill>{t}</Pill>} />
        </div>
      </section>

      <section>
        <div className="wrap-wide">
          <div className="section-head" style={{ margin: "0 auto 44px", textAlign: "center" }}>
            <p className="eyebrow" style={{ justifyContent: "center" }}>Get to Know Us Better</p>
            <h2>A partner you can count on</h2>
          </div>
          <div className="grid g4">
            {PORTFOLIO.map((p) => (
              <div key={p.label}>
                <PhotoImage src={p.img} alt={p.label} style={{ height: 180 }} />
                <p style={{ fontWeight: 700, fontFamily: "'Fraunces',serif", marginTop: 12 }}>{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="wrap-wide stats-grid">
          <div className="stat-block"><div className="num"><Counter value={1854} suffix="+" /></div><div className="lbl">Placements Completed</div></div>
          <div className="stat-block"><div className="num"><Counter value={245} suffix="+" /></div><div className="lbl">Unique Jobs Live</div></div>
          <div className="stat-block"><div className="num"><Counter value={169} suffix="+" /></div><div className="lbl">Client Testimonials</div></div>
          <div className="stat-block"><div className="num"><Counter value={98} suffix="%" /></div><div className="lbl">Client Satisfaction</div></div>
        </div>
      </section>

      <section>
        <div className="wrap-wide">
          <div className="section-head" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            <p className="eyebrow" style={{ justifyContent: "center" }}>Testimonials</p>
            <h2>Our clients say</h2>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      <section style={{ background: "var(--white)" }}>
        <div className="wrap-wide">
          <div className="section-head" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            <p className="eyebrow" style={{ justifyContent: "center" }}>Latest Insights</p>
            <h2>Journal from Growverde Solutions</h2>
          </div>
          <div className="grid g3">
            {INSIGHTS.map((post) => (
              <button type="button" className="card" style={{ overflow: "hidden", textAlign: "left", width: "100%", cursor: "pointer" }} key={post.title} onClick={() => setActiveArticle(post)}>
                <PhotoImage src={post.img} alt={post.title} style={{ height: 170, borderRadius: 0 }} />
                <div style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <img src={post.authorImg} alt={post.author} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                    <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{post.author} · {post.date}</span>
                  </div>
                  <h4 style={{ fontSize: 16.5, lineHeight: 1.4 }}>{post.title}</h4>
                  <span className="more" style={{ marginTop: 10, display: "inline-block" }}>Read Article →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--surface)" }}>
        <div className="wrap-wide">
          <div className="section-head" style={{ margin: "0 auto 44px", textAlign: "center" }}>
            <p className="eyebrow" style={{ justifyContent: "center" }}>Why Job Seekers Choose Us</p>
            <h2 style={{ color: "#fff" }}>We take care of the people we place</h2>
          </div>
          <div className="grid g4">
            {EMPLOYEE_CARE.map((c) => (
              <div className="card value-card" key={c.title} style={{ background: "var(--surface2)", borderColor: "rgba(255,255,255,.08)" }}>
                <div className="service-icon"><c.icon size={20} /></div>
                <h3 style={{ fontSize: 16.5, color: "#fff" }}>{c.title}</h3>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13.5, marginTop: 8 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap-wide">
          <div className="cta-banner">
            <h2>Ready to find your next great hire — or your next great role?</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <Link to={ROUTES.JOBS} className="btn btn-gold">Browse Jobs</Link>
              <Link to={ROUTES.RESUME} className="btn btn-outline-light">Submit Resume</Link>
            </div>
          </div>
        </div>
      </section>

      {activeService && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setActiveService(null); }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setActiveService(null)} aria-label="Close"><X size={16} /></button>
            <div className="service-icon"><activeService.icon size={22} /></div>
            <h2 style={{ fontSize: 26, margin: "16px 0 4px" }}>{activeService.title}</h2>
            <div className="article-body">
              {activeService.writeup.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <button className="btn btn-gold" style={{ width: "100%", marginTop: 10 }} onClick={() => { setActiveService(null); navigate(ROUTES.JOBS); }}>
              Browse Open Jobs
            </button>
          </div>
        </div>
      )}

      {activeArticle && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setActiveArticle(null); }}>
          <div className="modal-box wide">
            <button className="modal-close" onClick={() => setActiveArticle(null)} aria-label="Close"><X size={16} /></button>
            <p className="eyebrow">Journal</p>
            <h2 style={{ fontSize: 26, margin: "10px 0 4px" }}>{activeArticle.title}</h2>
            <div className="article-meta">
              <img src={activeArticle.authorImg} alt={activeArticle.author} />
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{activeArticle.author} · {activeArticle.date}</span>
            </div>
            <div className="article-body">
              {activeArticle.content.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
