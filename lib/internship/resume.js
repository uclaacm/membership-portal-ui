// Matches the backend's cap (membership-portal: internship/middleware/resumeUpload.js). Checked
// here too so an oversized file is turned away before it is sent at all.
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Where to open an application's resume: the uploaded PDF, served through this app's route
// handler (which attaches the session token), or, for applications from before uploads, the
// link the applicant pasted.
export function resumeHref(application) {
  if (!application) return null;
  if (application.resume && application._id) {
    return `/internship/applications/${encodeURIComponent(application._id)}/resume`;
  }
  if (application.resumeUrl && isHttpUrl(application.resumeUrl)) return application.resumeUrl;
  return null;
}

// Absolute version for spreadsheet exports, where a relative path means nothing.
export function resumeExportLink(application) {
  const href = resumeHref(application);
  if (!href) return "";
  if (href.startsWith("/") && typeof window !== "undefined") {
    return new URL(href, window.location.origin).toString();
  }
  return href;
}

export function formatFileSize(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
