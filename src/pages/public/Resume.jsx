import React, { useCallback, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { SEO } from "../../components/seo/SEO.jsx";
import { ROUTES } from "../../constants/routes.js";
import { Link } from "react-router-dom";
import { careersService } from "../../services/careersService.js";
import { useToast } from "../../context/ToastContext.jsx";

export function Resume() {
  const { push } = useToast();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = useCallback((f) => {
    if (f) setFile(f);
  }, []);

  // Emails straight to the company inbox with the resume attached as
  // submitted — any file type is accepted, nothing here restricts it
  // beyond the 10MB size cap already shown below.
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      push("Please attach your resume before submitting.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      formData.append("resume", file);
      const { emailSent } = await careersService.submitResume(formData);
      if (!emailSent) {
        // Nothing is stored server-side beyond the email itself — if it
        // didn't send, the submission didn't reach anyone, so this
        // isn't treated as success.
        push("Something went wrong sending your submission. Please try again in a moment.", "error");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SEO
        title="Submit Your Resume"
        description="Submit your resume to Growverde Solutions and our recruiters will match you to relevant roles across healthcare, technology, finance, legal, marketing, and HR as they open."
        path={ROUTES.RESUME}
      />
      <section className="page-hero">
        <div className="page-hero-ring" />
        <div className="wrap">
          <p className="crumb"><b>Home</b> / Submit Resume</p>
          <p className="eyebrow" style={{ color: "var(--gold)" }}>Work With Us</p>
          <h1>Submit Your Resume</h1>
          <p>Tell us about yourself once — our recruiters will match you to relevant roles as they open, even ones not posted yet.</p>
        </div>
      </section>

      <section>
        <div className="wrap resume-grid">
          <div>
            <div className="card resume-side-card">
              <h4>How it works</h4>
              <p>1. Share your resume and a few details below.<br />2. A Growverde Solutions recruiter reviews your background within 2 business days.<br />3. We reach out when a matching role opens.</p>
            </div>
            <div className="card resume-side-card">
              <h4>What we look for</h4>
              <p>We work across Healthcare, Technology, Finance, Legal, Marketing, and Human Resources — at every experience level, from early-career to executive.</p>
            </div>
            <div className="card resume-side-card">
              <h4>Privacy</h4>
              <p>Your information is shared only with your consent, and only with clients relevant to your background.</p>
            </div>
          </div>

          <div className="card" style={{ padding: 36 }}>
            {!submitted ? (
              <form onSubmit={onSubmit}>
                <div className="form-grid">
                  <div className="field"><label htmlFor="rFirst">First name</label><input id="rFirst" name="firstName" required /></div>
                  <div className="field"><label htmlFor="rLast">Last name</label><input id="rLast" name="lastName" required /></div>
                  <div className="field"><label htmlFor="rEmail">Email</label><input id="rEmail" name="email" type="email" required /></div>
                  <div className="field"><label htmlFor="rPhone">Phone</label><input id="rPhone" name="phone" type="tel" /></div>
                  <div className="field">
                    <label htmlFor="rField">Field of interest</label>
                    <select id="rField" name="fieldOfInterest">
                      <option>Healthcare + Life Sciences</option>
                      <option>Information Technology</option>
                      <option>Accounting + Finance</option>
                      <option>Marketing &amp; Sales</option>
                      <option>Human Resources</option>
                      <option>Legal Support</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="rExp">Experience level</label>
                    <select id="rExp" name="experienceLevel">
                      <option>Entry-level</option>
                      <option>Mid-level</option>
                      <option>Senior</option>
                      <option>Executive</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label htmlFor="rNote">Anything else we should know?</label>
                    <textarea id="rNote" name="note" rows={4} placeholder="Preferred location, availability, salary expectations…" />
                  </div>
                </div>

                <div className="field full">
                  <label>Resume / CV</label>
                  {!file ? (
                    <label
                      className={`dropzone${dragOver ? " drag" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                    >
                      <UploadCloud />
                      <p><b>Click to upload</b> or drag and drop</p>
                      <small>Any document format — up to 10MB</small>
                      <input type="file" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
                    </label>
                  ) : (
                    <div className="file-chip">
                      <FileText size={18} />
                      <span className="name">{file.name}</span>
                      <button type="button" onClick={() => setFile(null)} aria-label="Remove file" style={{ color: "var(--muted)" }}><X size={15} /></button>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-gold" style={{ width: "100%", marginTop: 6 }} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Resume"}
                </button>
              </form>
            ) : (
              <div className="success-box">
                <div className="success-icon"><CheckCircle2 size={26} /></div>
                <h3 style={{ fontSize: 22 }}>Resume received</h3>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>Thanks — a Growverde Solutions recruiter will review your background and reach out within 2 business days.</p>
                <Link to={ROUTES.JOBS} className="btn btn-outline btn-sm" style={{ marginTop: 20 }}>Browse Open Jobs Meanwhile</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
