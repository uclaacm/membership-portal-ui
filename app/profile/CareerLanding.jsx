import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import "./careerLanding.scss";

const EDIT_URL = "/profile/career/edit";
const EMPTY_PROFILE = {};
const years = ["Freshman", "Sophomore", "Junior", "Senior", "Post-Senior"];

// Only web URLs should become external links in the profile preview.
function webUrl(value) {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    url.searchParams.set("utm_source", "uclaacm");
    url.searchParams.set("utm_medium", "referral");
    return url.href;
  } catch {
    return null;
  }
}

function Progress({ value, label }) {
  return (
    <div
      className="career-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function CareerTile({ title, description, icon, tone, href, status, children }) {
  const content = (
    <>
      <span className={`career-tile-icon career-tile-icon-${tone}`}>
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
      </span>
      <div className="career-tile-content">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        {status && <span className={`career-badge ${status === "Open" ? "career-badge-open" : ""}`}>{status}</span>}
      </div>
      {href && <i className="fa-solid fa-chevron-right career-tile-arrow" aria-hidden="true" />}
    </>
  );
  return href ? (
    <Link href={href} className="career-tile">
      {content}
    </Link>
  ) : (
    <div className={`career-tile career-tile-unavailable${status === "Coming Soon" ? " career-tile-coming-soon" : ""}`}>{content}</div>
  );
}

export default function CareerLanding({ profile = EMPTY_PROFILE, isInternshipOpen = null }) {
  const tasks = [
    {
      label: "Add a bio (50+ chars)",
      complete: Boolean(profile.bio && profile.bio.length >= 50),
      field: "bio",
    },
    { label: "List at least 3 skills", complete: profile.skills?.length >= 3, field: "skillInput" },
    { label: "Add 2+ career interests", complete: profile.careerInterests?.length >= 2, field: "careerInterestInput" },
    {
      label: "Add your LinkedIn or GitHub",
      complete: Boolean(profile.linkedinUrl || profile.githubUrl),
      field: "linkedinUrl",
    },
    {
      label: "Add a portfolio or personal website",
      complete: Boolean(profile.portfolioUrl || profile.personalWebsite),
      field: "portfolioUrl",
    },
    { label: "Add your pronouns", complete: Boolean(profile.pronouns), field: "pronouns" },
  ];
  const completed = tasks.filter(task => task.complete).length;
  const completeness = Math.round((completed / tasks.length) * 100);
  const isPublic = profile.isProfilePublic ?? true;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.name || "Your career profile";
  const github = webUrl(profile.githubUrl);
  const website = webUrl(profile.personalWebsite);
  const links = [
    {
      label: "Resume",
      icon: "fa-solid fa-file-lines",
      url: webUrl(profile.resumeUrl),
      empty: "Not added",
      field: "resumeUrl",
    },
    {
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin",
      url: webUrl(profile.linkedinUrl),
      empty: "Not added",
      field: "linkedinUrl",
    },
    {
      label: "Portfolio",
      icon: "fa-solid fa-globe",
      url: webUrl(profile.portfolioUrl),
      empty: "Not added",
      field: "portfolioUrl",
    },
  ];

  return (
    <main className="career-landing">
      <header className="career-hero">
        <div className="career-hero-copy">
          <p className="career-eyebrow">Career Hub</p>
          <h1>Build your future with ACM</h1>
          <p>
            Manage your professional profile, explore opportunities, and connect with recruiters and committee leads.
          </p>
        </div>
        <div className="career-hero-art" aria-hidden="true">
          <div className="career-art-orbit" />
          <div className="career-art-document career-art-document-back">
            <span />
            <span />
            <span />
          </div>
          <div className="career-art-document career-art-document-front">
            <i className="fa-solid fa-id-card" />
            <span />
            <span />
            <span />
          </div>
          <div className="career-art-case">
            <i className="fa-solid fa-briefcase" />
          </div>
          <span className="career-art-spark career-art-spark-one" />
          <span className="career-art-spark career-art-spark-two" />
        </div>
      </header>

      <div className="career-dashboard">
        <section className="career-tiles" aria-label="Career opportunities and tools">
          <CareerTile
            title="My Career Profile"
            description="Update your bio, skills, and professional links to get noticed."
            icon="fa-user"
            tone="blue"
            href={EDIT_URL}
          >
            <div className="career-tile-progress">
              <Progress value={completeness} label="Career profile completion" />
              <span>{completeness}% complete</span>
            </div>
            <span className={`career-badge ${isPublic ? "career-badge-public" : "career-badge-private"}`}>
              <i className={`fa-solid ${isPublic ? "fa-globe" : "fa-lock"}`} aria-hidden="true" />
              {isPublic ? "Public" : "Private"}
            </span>
          </CareerTile>
          <CareerTile
            title="Recruitment"
            description="Connect with companies and explore job and internship opportunities."
            icon="fa-briefcase"
            tone="purple"
            status="Coming Soon"
          />
          <CareerTile
            title="Committee Applications"
            description="Apply to join ACM committees and officer positions."
            icon="fa-users"
            tone="green"
            href={isInternshipOpen === false ? null : "/internship"}
            status={isInternshipOpen === null ? "Check availability" : isInternshipOpen ? "Open" : "Closed"}
          />
          <CareerTile
            title="Career Resources"
            description="Resume templates, interview tips, and career guides."
            icon="fa-book"
            tone="gold"
            status="Coming Soon"
          />
        </section>

        <aside className="career-preview" aria-labelledby="career-preview-title">
          <div className="career-preview-header">
            <h2 id="career-preview-title">Your Career Profile</h2>
            <Link href={EDIT_URL} className="career-edit-button">
              <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
              Edit
            </Link>
          </div>
          <div className="career-identity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.picture || "/unknown.png"}
              alt="Your profile photo"
              referrerPolicy="no-referrer"
              className="career-avatar"
            />
            <h3>{name}</h3>
            {profile.pronouns && <p className="career-pronouns">{profile.pronouns}</p>}
            <p>
              {[years[Number(profile.year) - 1], profile.major].filter(Boolean).join(" · ") ||
                "Add your details in My Profile"}
            </p>
          </div>
          <div className="career-socials">
            {[
              { label: "GitHub", icon: "fa-brands fa-github", url: github, field: "githubUrl" },
              { label: "Website", icon: "fa-solid fa-link", url: website, field: "personalWebsite" },
            ].map(({ label, icon, url, field }) =>
              url ? (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer">
                  <i className={icon} aria-hidden="true" />
                  {label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link key={label} href={`${EDIT_URL}#${field}`}>
                  <i className={icon} aria-hidden="true" />
                  Add {label}
                </Link>
              )
            )}
          </div>
          {profile.bio && <p className="career-preview-bio">{profile.bio}</p>}
          {[
            { label: "Skills", values: profile.skills },
            { label: "Career interests", values: profile.careerInterests },
          ].map(
            ({ label, values }) =>
              values?.length > 0 && (
                <div className="career-preview-tags" key={label}>
                  <h4>{label}</h4>
                  <div>
                    {values.map(value => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                </div>
              )
          )}
          <div className="career-profile-links">
            {links.map(({ label, icon, url, empty, field }) => {
              const content = (
                <>
                  <i className={icon} aria-hidden="true" />
                  <span>{label}</span>
                  <span className="career-link-status">{url ? "View" : empty}</span>
                  <i
                    className={`fa-solid ${url ? "fa-arrow-up-right-from-square" : "fa-chevron-right"}`}
                    aria-hidden="true"
                  />
                  {url && <span className="sr-only"> (opens in a new tab)</span>}
                </>
              );
              return url ? (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <Link key={label} href={`${EDIT_URL}#${field}`}>
                  {content}
                </Link>
              );
            })}
          </div>
        </aside>
      </div>

      <section
        className={`career-completion ${completed === tasks.length ? "career-completion-done" : ""}`}
        aria-labelledby="career-completion-title"
      >
        <div className="career-completion-header">
          <span className="career-completion-icon">
            <i className={`fa-solid ${completed === tasks.length ? "fa-check" : "fa-lightbulb"}`} aria-hidden="true" />
          </span>
          <div>
            <h2 id="career-completion-title">
              {completed === tasks.length ? "Your profile is complete" : "Complete Your Profile"}
            </h2>
            <p>
              {completed === tasks.length
                ? "You’re all set. Keep your profile up to date as you grow."
                : "A complete profile helps recruiters and committee leads find you."}
            </p>
          </div>
          <div className="career-completion-progress">
            <span>
              {completed} / {tasks.length} complete
            </span>
            <Progress value={completeness} label="Profile checklist completion" />
          </div>
        </div>
        <ul className="career-checklist">
          {tasks.map(({ label, detail, complete, field }) => (
            <li key={field} className={complete ? "is-complete" : ""}>
              <Link href={`${EDIT_URL}#${field}`}>
                <span className="career-check" aria-hidden="true">
                  {complete && <i className="fa-solid fa-check" />}
                </span>
                <span>
                  {label}
                  {detail && <small>{detail}</small>}
                  <span className="sr-only">{complete ? " (complete)" : " (incomplete)"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

CareerLanding.propTypes = { profile: PropTypes.object, isInternshipOpen: PropTypes.bool };
