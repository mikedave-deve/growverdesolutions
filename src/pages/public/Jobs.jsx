import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SEO } from "../../components/seo/SEO.jsx";
import { SITE_URL } from "../../constants/seo.js";
import { ROUTES } from "../../constants/routes.js";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { JOBS } from "../../data/publicSiteData.js";

export function Jobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");

  const categories = useMemo(() => [...new Set(JOBS.map((j) => j.cat))], []);
  const locations = useMemo(() => [...new Set(JOBS.map((j) => j.loc))], []);

  const filtered = JOBS.filter((j) => {
    if (category && j.cat !== category) return false;
    if (type && j.type !== type) return false;
    if (location && j.loc !== location) return false;
    if (search && !(j.title.toLowerCase().includes(search.toLowerCase()) || j.cat.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  // The open job lives in the URL (?job=id) rather than only in React
  // state — that's what makes each individual job a distinct,
  // crawlable, shareable link instead of being invisible inside a
  // client-side-only modal.
  const openJobId = Number(searchParams.get("job")) || null;
  const openJob = JOBS.find((j) => j.id === openJobId);
  const setOpenJobId = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("job", id);
    else next.delete("job");
    setSearchParams(next);
  };

  const jobsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: JOBS.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: j.title,
      url: `${SITE_URL}${ROUTES.JOBS}?job=${j.id}`,
    })),
  };

  // Only fields we actually have accurate data for — no datePosted or
  // validThrough, since JOBS is static demo data with no real posting
  // dates, and fabricating them would violate Google's structured
  // data guidelines (and just be wrong).
  const openJobPostingJsonLd = openJob && {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: openJob.title,
    description: openJob.summary,
    identifier: { "@type": "PropertyValue", name: "Growverde Solutions", value: String(openJob.id) },
    hiringOrganization: { "@type": "Organization", name: openJob.employer || "Growverde Solutions", sameAs: SITE_URL },
    employmentType: openJob.type === "Full-time" ? "FULL_TIME" : openJob.type === "Part-time" ? "PART_TIME" : "CONTRACTOR",
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "USA" },
  };

  return (
    <div>
      <SEO
        title={openJob ? `${openJob.title} — ${openJob.cat}` : "Browse Open Jobs"}
        description={
          openJob
            ? `${openJob.title} (${openJob.type}, ${openJob.loc}) — ${openJob.summary}`
            : "Search current job openings from Growverde Solutions' client network — filter by category, location, or job type across healthcare, tech, finance, legal, marketing, and HR."
        }
        path={openJob ? `${ROUTES.JOBS}?job=${openJob.id}` : ROUTES.JOBS}
        jsonLd={openJob ? [jobsItemListJsonLd, openJobPostingJsonLd] : jobsItemListJsonLd}
      />
      <section className="page-hero">
        <div className="page-hero-ring" />
        <div className="wrap">
          <p className="crumb"><b>Home</b> / Browse Jobs</p>
          <p className="eyebrow" style={{ color: "var(--gold)" }}>245+ Unique Roles</p>
          <h1>Browse Open Jobs</h1>
          <p>Search current openings from Growverde Solutions' client network — filter by category, location, or job type to find your fit.</p>
        </div>
      </section>

      <section style={{ paddingTop: 44 }}>
        <div className="wrap">
          <div className="filters">
            <input type="text" placeholder="Search job title or keyword…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All Job Types</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <p className="job-count">{filtered.length} job{filtered.length === 1 ? "" : "s"} found</p>

          <div className="job-list">
            {filtered.length === 0 && (
              <div className="card" style={{ padding: 50, textAlign: "center", color: "var(--muted)" }}>
                No jobs match those filters — try broadening your search.
              </div>
            )}
            {filtered.map((j) => (
              <div className="card job-card" key={j.id}>
                <div className="job-main">
                  <div className="job-icon">
                    {j.img ? <img src={j.img} alt={j.cat} /> : j.title.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="job-title">{j.title}</div>
                    <div className="job-meta"><span>{j.loc}</span><span>·</span><span>{j.type}</span></div>
                    <div className="job-tags">
                      <span className="tag">{j.cat}</span>
                      <span className="tag teal">{j.type}</span>
                      {j.employer && <span className="tag" style={{ background: "var(--ink)", color: "#fff" }}>Direct Hire · {j.employer}</span>}
                    </div>
                  </div>
                </div>
                <div className="job-side">
                  <div className="job-salary">{j.salary}<span>Estimated range</span></div>
                  <Link to={`${ROUTES.JOBS}?job=${j.id}`} className="btn btn-primary btn-sm">View Role</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {openJob && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setOpenJobId(null); }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setOpenJobId(null)} aria-label="Close"><X size={16} /></button>
            <p className="eyebrow">{openJob.cat} · {openJob.type}</p>
            <h2 style={{ fontSize: 26, margin: "10px 0 6px" }}>{openJob.title}</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{openJob.loc} · {openJob.salary}</p>
            <div className="modal-section"><h4>Overview</h4><p>{openJob.summary}</p></div>
            <div className="modal-section"><h4>Responsibilities</h4><ul>{openJob.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></div>
            <div className="modal-section"><h4>Requirements</h4><ul>{openJob.requirements.map((r) => <li key={r}>{r}</li>)}</ul></div>
            <button className="btn btn-gold" style={{ width: "100%", marginTop: 26 }} onClick={() => { setOpenJobId(null); navigate(ROUTES.RESUME); }}>
              Apply — Submit Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
