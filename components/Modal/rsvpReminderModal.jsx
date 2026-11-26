'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import './rsvpReminderModal.scss';

export default function RSVPReminderModal({ event, remindersAllowed, onConfirm, onClose }) {
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const checkboxRef = useRef(null);

  useEffect(() => {
    checkboxRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (keyEvent) => {
      if (keyEvent.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, submitting]);

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await onConfirm(remindersAllowed && emailRemindersEnabled);
      if (!result?.success) setError(result?.error || 'Could not RSVP. Please try again.');
    } catch {
      setError('Could not RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rsvp-reminder-backdrop">
      <div
        className="rsvp-reminder-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-reminder-title"
      >
        <h2 id="rsvp-reminder-title">RSVP to {event.title}</h2>
        <p>You’ll receive a confirmation email after RSVPing. Choose whether you’d also like reminders.</p>
        <form onSubmit={submit}>
          <label className="rsvp-reminder-option">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={emailRemindersEnabled}
              disabled={!remindersAllowed}
              onChange={(changeEvent) => setEmailRemindersEnabled(changeEvent.target.checked)}
            />
            <span>Email me a reminder before this event</span>
          </label>
          <p className="rsvp-reminder-note">
            {remindersAllowed ? (
              <>If email is configured, we’ll send one reminder 24 hours before the event. Past send times are skipped.</>
            ) : (
              <>Event reminders are off for your account. <Link href="/profile#event-email-preferences">Manage email preferences</Link>.</>
            )}
          </p>
          {error && <p className="rsvp-reminder-error" role="alert">{error}</p>}
          <div className="rsvp-reminder-actions">
            <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="is-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Confirm RSVP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

RSVPReminderModal.propTypes = {
  event: PropTypes.shape({ title: PropTypes.string.isRequired }).isRequired,
  remindersAllowed: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
