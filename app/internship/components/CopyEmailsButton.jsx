"use client";

import { useState } from "react";

export default function CopyEmailsButton({ applications, onCopied, onError }) {
  const [copying, setCopying] = useState(false);

  const handleClick = async () => {
    const emails = applications.map((application) => application.email).filter(Boolean);
    if (emails.length === 0) return;

    setCopying(true);
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      onCopied(emails.length);
    } catch (err) {
      onError((err && err.message) || "Couldn't copy emails to clipboard");
    } finally {
      setCopying(false);
    }
  };

  return (
    <button
      type="button"
      className="copy-emails-button"
      onClick={handleClick}
      disabled={copying || applications.length === 0}
    >
      Copy Emails ({applications.length})
    </button>
  );
}
