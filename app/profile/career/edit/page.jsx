"use client";

import { useCallback, useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Switch from "@/components/Switch";
import UnsavedChangesGuard from "@/components/UnsavedChangesGuard.jsx";
import Topbar from "@/components/Topbar";
import logoutUser from "@/app/actions/auth/logoutUser";
import updateCareerProfile from "@/app/actions/user/updateCareerProfile";
import fetchCareerProfile from "@/app/actions/user/fetchCareerProfile";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from "@/lib/atoms";
import "./page.scss";

const careerSnapshot = profile => ({
  bio: profile.bio || "",
  pronouns: profile.pronouns || "",
  linkedinUrl: profile.linkedinUrl || "",
  githubUrl: profile.githubUrl || "",
  portfolioUrl: profile.portfolioUrl || "",
  personalWebsite: profile.personalWebsite || "",
  resumeUrl: profile.resumeUrl || "",
  skills: profile.skills || [],
  careerInterests: profile.careerInterests || [],
  isProfilePublic: profile.isProfilePublic ?? true,
});
const withPendingTag = (values, input) => {
  const value = input.trim();
  return value && values.length < 20 && !values.includes(value) ? [...values, value] : values;
};

const normalizeUrl = url => {
  if (!url || url.trim() === "") return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const isValidLinkedInUrl = url => {
  if (!url || url.trim() === "") return true;
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
  return linkedInPattern.test(normalizeUrl(url));
};

const isValidGitHubUrl = url => {
  if (!url || url.trim() === "") return true;
  const gitHubPattern = /^https?:\/\/(www\.)?github\.com\/.+/i;
  return gitHubPattern.test(normalizeUrl(url));
};

const isValidUrl = url => {
  if (!url || url.trim() === "") return true;
  try {
    const parsedUrl = new URL(url);
    return !!parsedUrl;
  } catch (e) {
    return false;
  }
};

const getLinkedInUrlError = url => {
  if (!url || url.trim() === "") return null;
  if (!isValidUrl(url)) return "Please enter a valid URL";
  if (!isValidLinkedInUrl(url)) {
    return "LinkedIn URL must be in the format: https://linkedin.com/in/username";
  }
  return null;
};

const getGitHubUrlError = url => {
  if (!url || url.trim() === "") return null;
  if (!isValidUrl(url)) return "Please enter a valid URL";
  if (!isValidGitHubUrl(url)) {
    return "GitHub URL must be in the format: https://github.com/username";
  }
  return null;
};

export default function CareerEditPage() {
  const router = useRouter();
  const userProfile = useAtomValue(authUserProfileAtom);
  const setAuthUserProfile = useSetAtom(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [careerProfile, setCareerProfile] = useState(userProfile || {});
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [pronouns, setPronouns] = useState(userProfile?.pronouns || "");
  const [linkedinUrl, setLinkedinUrl] = useState(userProfile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(userProfile?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(userProfile?.portfolioUrl || "");
  const [personalWebsite, setPersonalWebsite] = useState(userProfile?.personalWebsite || "");
  const [resumeUrl, setResumeUrl] = useState(userProfile?.resumeUrl || "");
  const [skills, setSkills] = useState(userProfile?.skills || []);
  const [careerInterests, setCareerInterests] = useState(userProfile?.careerInterests || []);
  const [isProfilePublic, setIsProfilePublic] = useState(
    userProfile?.isProfilePublic !== undefined ? userProfile.isProfilePublic : true
  );
  const [skillInput, setSkillInput] = useState("");
  const [careerInterestInput, setCareerInterestInput] = useState("");
  const [saveState, setSaveState] = useState({
    saving: false,
    saveSuccess: false,
    saveError: null,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const applyProfile = useCallback(profile => {
    const saved = careerSnapshot(profile);
    setCareerProfile(profile);
    setBio(saved.bio);
    setPronouns(saved.pronouns);
    setLinkedinUrl(saved.linkedinUrl);
    setGithubUrl(saved.githubUrl);
    setPortfolioUrl(saved.portfolioUrl);
    setPersonalWebsite(saved.personalWebsite);
    setResumeUrl(saved.resumeUrl);
    setSkills(saved.skills);
    setCareerInterests(saved.careerInterests);
    setIsProfilePublic(saved.isProfilePublic);
    setSkillInput("");
    setCareerInterestInput("");
    setValidationErrors({});
  }, []);

  const resetForm = () => applyProfile(careerProfile);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // The form is absent on the first render, when native hash scrolling runs.
    const frame = requestAnimationFrame(() => {
      const field = document.getElementById(window.location.hash.slice(1));
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.focus({ preventScroll: true });
        field.scrollIntoView({ block: "start" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  useEffect(() => {
    if (!userProfile) return;
    let cancelled = false;
    (async () => {
      const career = await fetchCareerProfile();
      if (cancelled) return;
      applyProfile({ ...userProfile, ...(career || {}) });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userProfile, applyProfile]);

  const draft = {
    bio,
    pronouns,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    personalWebsite,
    resumeUrl,
    skills,
    careerInterests,
    isProfilePublic,
  };
  const changed =
    JSON.stringify(careerSnapshot(draft)) !== JSON.stringify(careerSnapshot(careerProfile)) ||
    Boolean(skillInput || careerInterestInput);

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const errors = {};

    if (name === "linkedinUrl") {
      const error = getLinkedInUrlError(value);
      if (error) errors.linkedinUrl = error;
    }

    if (name === "githubUrl") {
      const error = getGitHubUrlError(value);
      if (error) errors.githubUrl = error;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!changed || saveState.saving || saveState.saveSuccess) return;

    const validationErrors = {};
    const linkedinError = getLinkedInUrlError(linkedinUrl);
    const githubError = getGitHubUrlError(githubUrl);

    if (linkedinError) validationErrors.linkedinUrl = linkedinError;
    if (githubError) validationErrors.githubUrl = githubError;

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      setSaveState(prev => ({ ...prev, saveError: "Please fix the validation errors before saving." }));
      return;
    }

    setSaveState({
      saving: true,
      saveSuccess: false,
      saveError: null,
    });
    setValidationErrors({});

    const updates = {
      bio,
      pronouns,
      skills: withPendingTag(skills, skillInput),
      careerInterests: withPendingTag(careerInterests, careerInterestInput),
      isProfilePublic,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      personalWebsite,
      resumeUrl,
    };

    try {
      const result = await updateCareerProfile(updates);
      if (!result?.success) {
        setSaveState({
          saving: false,
          saveSuccess: false,
          saveError: result?.error || "Failed to save changes",
        });
        return;
      }

      applyProfile(updates);
      setSkillInput("");
      setCareerInterestInput("");
      setSaveState({ saving: false, saveSuccess: true, saveError: null });
      setAuthUserProfile(prev => ({
        ...(prev || {}),
        ...updates,
      }));
      setTimeout(() => {
        setSaveState(prev => ({ ...prev, saveSuccess: false }));
        router.push("/profile/career");
      }, 2000);
    } catch (error) {
      setSaveState({
        saving: false,
        saveSuccess: false,
        saveError: error.message || "Failed to save changes",
      });
    }
  };

  const addCareerInterest = e => {
    if (e.key === "Enter" && careerInterestInput.trim()) {
      e.preventDefault();
      const newInterest = careerInterestInput.trim();
      if (careerInterests.length < 20 && !careerInterests.includes(newInterest)) {
        setCareerInterests(prev => [...prev, newInterest]);
        setCareerInterestInput("");
      }
    }
  };

  const removeCareerInterest = interestToRemove => {
    setCareerInterests(prev => prev.filter(interest => interest !== interestToRemove));
  };

  const addSkill = e => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (skills.length < 20 && !skills.includes(newSkill)) {
        setSkills(prev => [...prev, newSkill]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = skillToRemove => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const checklist = [
    { label: "Add a bio (50+ chars)", complete: bio.length >= 50, field: "bio" },
    { label: "List at least 3 skills", complete: skills.length >= 3, field: "skillInput" },
    { label: "Add 2+ career interests", complete: careerInterests.length >= 2, field: "careerInterestInput" },
    { label: "Add your LinkedIn or GitHub", complete: Boolean(linkedinUrl || githubUrl), field: "linkedinUrl" },
    { label: "Add a portfolio or website", complete: Boolean(portfolioUrl || personalWebsite), field: "portfolioUrl" },
    { label: "Add your pronouns", complete: Boolean(pronouns), field: "pronouns" },
  ];
  const completed = checklist.filter(item => item.complete).length;
  const completeness = Math.round((completed / checklist.length) * 100);
  const { saving, saveSuccess, saveError } = saveState;
  const name = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || "Your career profile";
  const years = ["Freshman", "Sophomore", "Junior", "Senior", "Post-Senior"];
  const linkFields = [
    {
      id: "linkedinUrl",
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin",
      value: linkedinUrl,
      set: setLinkedinUrl,
      placeholder: "https://linkedin.com/in/yourname",
      required: true,
    },
    {
      id: "githubUrl",
      label: "GitHub",
      icon: "fa-brands fa-github",
      value: githubUrl,
      set: setGithubUrl,
      placeholder: "https://github.com/yourname",
      required: true,
    },
    {
      id: "portfolioUrl",
      label: "Portfolio",
      icon: "fa-solid fa-globe",
      value: portfolioUrl,
      set: setPortfolioUrl,
      placeholder: "https://yourportfolio.com",
    },
    {
      id: "personalWebsite",
      label: "Personal website",
      icon: "fa-solid fa-link",
      value: personalWebsite,
      set: setPersonalWebsite,
      placeholder: "https://yourwebsite.com",
    },
    {
      id: "resumeUrl",
      label: "Resume URL",
      icon: "fa-solid fa-file-lines",
      value: resumeUrl,
      set: setResumeUrl,
      placeholder: "https://drive.google.com/…",
    },
  ];

  if (!mounted) return null;

  return (
    <div>
      <Topbar picture={userProfile?.picture} onLogout={handleLogout} isRealAdmin={isAdmin} isOfficer={isOfficer} />
      <main className="career-profile-page">
        <UnsavedChangesGuard dirty={changed && !saveSuccess} />
        <Link href="/profile/career" className="career-edit-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Career Hub
        </Link>
        <header className="career-edit-header">
          <div>
            <h1>Edit Career Profile</h1>
            <p>Keep your experience, skills, and professional links up to date.</p>
          </div>
          <div className="career-edit-actions">
            {changed && (
              <button
                type="button"
                className="career-edit-button"
                disabled={saving || saveSuccess}
                onClick={() => {
                  resetForm();
                  setSaveState({ saving: false, saveSuccess: false, saveError: null });
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              form="career-profile-form"
              className="career-edit-button career-edit-primary"
              disabled={!loaded || !changed || saving || saveSuccess}
            >
              <i
                className={`fa-solid ${saving ? "fa-spinner fa-spin" : saveSuccess ? "fa-check" : "fa-check-to-slot"}`}
                aria-hidden="true"
              />
              {saving ? "Saving…" : saveSuccess ? "Saved" : "Save Changes"}
            </button>
          </div>
        </header>
        {saveError && (
          <div className="career-edit-notice career-edit-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="career-edit-notice career-edit-success" role="status">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            Profile saved. Returning to Career Hub…
          </div>
        )}
        <div className="career-edit-columns">
          <form id="career-profile-form" className="career-edit-form" onSubmit={handleSubmit}>
            <fieldset disabled={!loaded || saving || saveSuccess}>
              <section className="career-edit-panel" aria-labelledby="career-about-title">
                <div className="career-edit-section-heading">
                  <span className="career-edit-section-icon">
                    <i className="fa-solid fa-user" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="career-about-title">About You</h2>
                    <p>Introduce yourself to recruiters and committee leads.</p>
                  </div>
                </div>
                <div className="career-edit-field career-edit-pronouns">
                  <label htmlFor="pronouns">
                    Pronouns <span className="career-edit-optional">Optional</span>
                  </label>
                  <input
                    id="pronouns"
                    name="pronouns"
                    value={pronouns}
                    onChange={e => setPronouns(e.target.value)}
                    placeholder="e.g., she/her, he/him, they/them"
                    maxLength={50}
                  />
                </div>
                <div className="career-edit-field">
                  <div className="career-edit-label-row">
                    <label htmlFor="bio">Bio</label>
                    <span>{bio.length} / 1,000</span>
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Share your interests, what you’re working on, and what you’d like to do next…"
                    rows={5}
                    maxLength={1000}
                    aria-describedby="career-bio-help"
                  />
                  <p id="career-bio-help" className="career-edit-help">
                    Write at least 50 characters to complete this part of your profile.
                  </p>
                </div>
              </section>

              <section className="career-edit-panel" aria-labelledby="career-links-title">
                <div className="career-edit-section-heading">
                  <span className="career-edit-section-icon">
                    <i className="fa-solid fa-link" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="career-links-title">Professional Links</h2>
                    <p>Share your work and where people can find you.</p>
                  </div>
                </div>
                <div className="career-edit-link-grid">
                  {linkFields.map(({ id, label, icon, value, set, placeholder, required }) => (
                    <div className="career-edit-field" key={id}>
                      <label htmlFor={id}>
                        {label} <span className="career-edit-optional">{required ? "Required" : "Optional"}</span>
                      </label>
                      <div className={`career-edit-input-icon ${validationErrors[id] ? "has-error" : ""}`}>
                        <i className={icon} aria-hidden="true" />
                        <input
                          type="url"
                          id={id}
                          name={id}
                          value={value}
                          onChange={e => {
                            set(e.target.value);
                            if (validationErrors[id]) setValidationErrors(prev => ({ ...prev, [id]: null }));
                          }}
                          onBlur={handleBlur}
                          placeholder={placeholder}
                          required={required}
                          aria-invalid={Boolean(validationErrors[id])}
                          aria-describedby={validationErrors[id] ? `${id}-error` : undefined}
                        />
                      </div>
                      {validationErrors[id] && (
                        <p id={`${id}-error`} className="career-edit-field-error">
                          {validationErrors[id]}
                        </p>
                      )}
                      {id === "resumeUrl" && <p className="career-edit-help">Use a shareable link to your resume.</p>}
                    </div>
                  ))}
                </div>
              </section>

              <div className="career-edit-tag-panels">
                {[
                  {
                    title: "Skills",
                    id: "skillInput",
                    description: "Add your technical and soft skills.",
                    placeholder: "e.g., Python, UI design",
                    values: skills,
                    input: skillInput,
                    set: setSkillInput,
                    add: addSkill,
                    remove: removeSkill,
                    icon: "fa-code",
                  },
                  {
                    title: "Career Interests",
                    id: "careerInterestInput",
                    description: "What fields or roles interest you?",
                    placeholder: "e.g., Software engineering",
                    values: careerInterests,
                    input: careerInterestInput,
                    set: setCareerInterestInput,
                    add: addCareerInterest,
                    remove: removeCareerInterest,
                    icon: "fa-compass",
                  },
                ].map(({ title, id, description, placeholder, values, input, set, add, remove, icon }) => (
                  <section className="career-edit-panel" key={id} aria-labelledby={`${id}-title`}>
                    <div className="career-edit-section-heading">
                      <span className="career-edit-section-icon">
                        <i className={`fa-solid ${icon}`} aria-hidden="true" />
                      </span>
                      <div>
                        <h2 id={`${id}-title`}>
                          {title}
                          <span className="career-edit-count">{values.length} / 20</span>
                        </h2>
                        <p>{description}</p>
                      </div>
                    </div>
                    <div className="career-edit-field">
                      <label className="sr-only" htmlFor={id}>
                        Add {title.toLowerCase()}
                      </label>
                      <input
                        id={id}
                        name={id}
                        value={input}
                        onChange={e => set(e.target.value)}
                        onKeyDown={add}
                        placeholder={placeholder}
                        maxLength={50}
                        disabled={values.length >= 20}
                        aria-describedby={`${id}-help`}
                      />
                      <p className="career-edit-help" id={`${id}-help`}>
                        Press Enter to add. Up to 20.
                      </p>
                    </div>
                    <div className="career-edit-tags" aria-label={title}>
                      {values.map(value => (
                        <span key={value}>
                          {value}
                          <button type="button" onClick={() => remove(value)} aria-label={`Remove ${value}`}>
                            <i className="fa-solid fa-xmark" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </fieldset>
            <div className="career-edit-footer">
              <p>Changes are saved when you select Save Changes.</p>
              <button
                type="submit"
                className="career-edit-button career-edit-primary"
                disabled={!loaded || !changed || saving || saveSuccess}
              >
                {saving ? "Saving…" : saveSuccess ? "Saved" : "Save Changes"}
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </form>

          <aside className="career-edit-sidebar" aria-label="Profile overview and settings">
            <section className="career-edit-panel career-edit-summary" aria-label="Your profile">
              <div className="career-edit-summary-banner" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userProfile?.picture || "/unknown.png"}
                alt="Your profile photo"
                className="career-edit-avatar"
                referrerPolicy="no-referrer"
              />
              <h2>{name}</h2>
              <p>{[years[Number(userProfile?.year) - 1], userProfile?.major].filter(Boolean).join(" · ")}</p>
              <span className={`career-edit-visibility ${isProfilePublic ? "is-public" : ""}`}>
                <i className={`fa-solid ${isProfilePublic ? "fa-globe" : "fa-lock"}`} aria-hidden="true" />
                {isProfilePublic ? "Public profile" : "Private profile"}
              </span>
              <Link href="/profile" className="career-edit-basic-link">
                Manage basic information
                <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </Link>
            </section>
            <section className="career-edit-panel" aria-labelledby="career-completion-heading">
              <div className="career-edit-completion-heading">
                <h2 id="career-completion-heading">Profile Completion</h2>
                <span>{completeness}%</span>
              </div>
              <div
                className="career-edit-progress"
                role="progressbar"
                aria-label="Profile completion"
                aria-valuenow={completeness}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${completeness}%` }} />
              </div>
              <p className="career-edit-help">{completed} of 6 complete</p>
              <ul className="career-edit-checklist">
                {checklist.map(({ label, complete, field }) => (
                  <li key={field}>
                    <a
                      href={`#${field}`}
                      onClick={() => document.getElementById(field)?.focus()}
                      className={complete ? "is-complete" : ""}
                    >
                      <span className="career-edit-check" aria-hidden="true">
                        {complete && <i className="fa-solid fa-check" />}
                      </span>
                      {label}
                      <span className="sr-only">{complete ? " (complete)" : " (incomplete)"}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <section className="career-edit-panel" aria-labelledby="career-privacy-title">
              <h2 id="career-privacy-title">Profile Visibility</h2>
              <Switch
                checked={isProfilePublic}
                onChange={setIsProfilePublic}
                disabled={!loaded || saving || saveSuccess}
                label="Make my profile public"
                description="Allow ACM members and recruiters to view your career profile in the directory."
                className="career-edit-privacy"
              />
            </section>
            <div className="career-edit-tip">
              <i className="fa-solid fa-lightbulb" aria-hidden="true" />
              <div>
                <h3>A little detail goes a long way</h3>
                <p>
                  Highlight specific skills and link to work you’re proud of. Keep your profile current as you gain
                  experience.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
