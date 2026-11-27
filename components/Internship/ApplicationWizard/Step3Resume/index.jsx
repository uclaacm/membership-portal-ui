"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

import uploadResume from "@/app/actions/internship/uploadResume";
import { myApplicationAtom } from "@/lib/atoms";
import { MAX_RESUME_BYTES, formatFileSize, resumeHref } from "@/lib/internship/resume";

function isPdf(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function Step3Resume({ onValidityChange, flushPendingRef }) {
  const router = useRouter();
  const [myApplication, setMyApplication] = useAtom(myApplicationAtom);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const inFlightRef = useRef(null);

  const resume = myApplication?.resume || null;
  const applicationId = myApplication?._id;
  const valid = Boolean(applicationId && resume) && !uploading;
  // Drafts from before uploads may still hold a pasted link, which no longer counts.
  const hasLegacyLinkOnly = !resume && Boolean(myApplication?.resumeUrl);

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, onValidityChange]);

  // The upload starts as soon as a file is picked, so the only thing to wait for when leaving
  // the step is an upload that hasn't finished yet.
  const flushPending = useCallback(async () => {
    if (inFlightRef.current) await inFlightRef.current;
  }, []);

  useEffect(() => {
    if (flushPendingRef) flushPendingRef.current = flushPending;
    return () => {
      if (flushPendingRef) flushPendingRef.current = null;
    };
  }, [flushPendingRef, flushPending]);

  const handleFileChange = useCallback(async (event) => {
    const picked = event.target.files?.[0];
    // Reset so picking the same file again (say, after an error) still fires onChange.
    event.target.value = "";
    if (!picked || !applicationId) return;

    if (!isPdf(picked)) {
      setError("Resume must be a PDF.");
      return;
    }
    if (picked.size > MAX_RESUME_BYTES) {
      setError(`Resume is too large. The limit is ${MAX_RESUME_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    // Some systems report an empty type for PDFs; the API checks the file's bytes either way.
    const file = picked.type === "application/pdf"
      ? picked
      : new File([picked], picked.name, { type: "application/pdf" });
    const formData = new FormData();
    formData.append("resume", file);

    setError(null);
    setUploading(true);
    const upload = uploadResume(applicationId, formData);
    inFlightRef.current = upload;
    try {
      const result = await upload;
      if (result.success) {
        setMyApplication(result.data);
      } else if (result.notFound || result.submittedBlock) {
        router.replace("/internship");
      } else {
        setError(result.error || "Upload failed. Please try again.");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      if (inFlightRef.current === upload) inFlightRef.current = null;
      setUploading(false);
    }
  }, [applicationId, router, setMyApplication]);

  const openPicker = useCallback(() => inputRef.current?.click(), []);
  const viewHref = resume ? resumeHref(myApplication) : null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Resume</h2>
        <p className="text-sm text-slate-600">
          Upload your resume as a PDF (up to {MAX_RESUME_BYTES / (1024 * 1024)} MB). Only you and the
          officers of the committees you applied to can see it.
        </p>
      </div>

      {hasLegacyLinkOnly && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Resume links are no longer accepted. Upload your resume as a PDF to continue.
        </div>
      )}

      <input
        ref={inputRef}
        id="internship-resume-file"
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleFileChange}
        disabled={uploading || !applicationId}
        aria-describedby="internship-resume-status"
      />

      {resume ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{resume.originalName || "resume.pdf"}</p>
            <p className="text-xs text-slate-500">
              {formatFileSize(resume.size)}
              {resume.uploadedAt &&
                ` · uploaded ${new Date(resume.uploadedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {viewHref && (
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                View
              </a>
            )}
            <button
              type="button"
              onClick={openPicker}
              disabled={uploading}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Replace"}
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="internship-resume-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-slate-300 px-4 py-8 text-center hover:border-blue-500 hover:bg-blue-50"
        >
          <span className="text-sm font-medium text-blue-700">
            {uploading ? "Uploading…" : "Choose a PDF to upload"}
          </span>
          <span className="text-xs text-slate-500">PDF only, up to {MAX_RESUME_BYTES / (1024 * 1024)} MB</span>
        </label>
      )}

      <p id="internship-resume-status" className="text-sm" role="status" aria-live="polite">
        {error && <span className="text-red-600">{error}</span>}
      </p>
    </section>
  );
}
