"use client";

import { useState } from "react";
import useCustomQuestionsEditor from "@/lib/hooks/useCustomQuestionsEditor";
import { DEFAULT_COMMITTEE_COLOR } from "@/lib/committees";
import CustomQuestionsEditor from "./CustomQuestionsEditor";

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }); // YYYY-MM-DD
}

export default function CommitteeForm({ initialValues, submitLabel, onSubmit }) {
  // An existing committee's name is permanent: officers and events reference it.
  const isEdit = Boolean(initialValues?.name);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [displayName, setDisplayName] = useState(initialValues?.displayName ?? "");
  // Empty until someone picks one, so saving other fields never stores the default as a choice.
  const [color, setColor] = useState(initialValues?.color ?? "");
  const [bannerUrl, setBannerUrl] = useState(initialValues?.bannerUrl ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [internLimit, setInternLimit] = useState(
    initialValues?.internLimit != null ? String(initialValues.internLimit) : "",
  );
  const [applicationDeadline, setApplicationDeadline] = useState(
    toDateInputValue(initialValues?.applicationDeadline),
  );
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const questionsEditor = useCustomQuestionsEditor(initialValues?.customQuestions);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const questionsError = questionsEditor.validate();
    if (questionsError) {
      setError(questionsError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const trimmedName = name.trim();
    const payload = {
      name: trimmedName,
      displayName: displayName.trim() || trimmedName,
      color: color || undefined,
      bannerUrl: isEdit ? bannerUrl.trim() : bannerUrl.trim() || undefined,
      description: description.trim() || undefined,
      internLimit: internLimit.trim() ? Number(internLimit) : undefined,
      applicationDeadline: applicationDeadline || undefined,
      isActive,
      customQuestions: questionsEditor.toPayload(),
    };

    const result = await onSubmit(payload);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form className="committee-form" onSubmit={handleSubmit}>
      {error && <div className="committee-form__error">{error}</div>}

      <label className="committee-form__field">
        <span className="committee-form__label">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Hack"
          required
          disabled={isEdit}
        />
        <span className="committee-form__hint">
          {isEdit
            ? "Permanent — officers and events are linked to this name. Change the display name instead."
            : "Permanent once created — officers and events are linked to this name."}
        </span>
      </label>

      <label className="committee-form__field">
        <span className="committee-form__label">Display Name</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={name.trim() || "Same as name"}
        />
        <span className="committee-form__hint">What members see. Safe to change at any time.</span>
      </label>

      <label className="committee-form__field committee-form__field--inline">
        <span className="committee-form__label">Color</span>
        <input type="color" value={color || DEFAULT_COMMITTEE_COLOR} onChange={(e) => setColor(e.target.value)} />
      </label>

      <label className="committee-form__field">
        <span className="committee-form__label">Banner Image URL</span>
        <input
          type="text"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          placeholder="/event_banners/acm_hack_banner.webp"
        />
        <span className="committee-form__hint">
          Default cover for this committee&apos;s events. Leave blank to use the ACM logo.
        </span>
      </label>

      <label className="committee-form__field">
        <span className="committee-form__label">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </label>

      <CustomQuestionsEditor editor={questionsEditor} />

      <label className="committee-form__field committee-form__field--inline">
        <span className="committee-form__label">Intern Limit</span>
        <input
          type="number"
          min="0"
          value={internLimit}
          onChange={(e) => setInternLimit(e.target.value)}
          placeholder="No limit"
        />
      </label>

      <label className="committee-form__field committee-form__field--inline">
        <span className="committee-form__label">Application Deadline</span>
        <input
          type="date"
          value={applicationDeadline}
          onChange={(e) => setApplicationDeadline(e.target.value)}
        />
      </label>

      <label className="committee-form__field committee-form__field--checkbox">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Active (accepting applications)</span>
      </label>

      <div className="committee-form__actions">
        <button type="submit" className="committee-form__submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
