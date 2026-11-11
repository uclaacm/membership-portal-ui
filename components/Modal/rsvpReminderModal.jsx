'use client';

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './rsvpReminderModal.scss';

export default function RSVPReminderModal({ event, onConfirm, onClose }) {
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
      const result = await onConfirm(emailRemindersEnabled);
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
              onChange={(changeEvent) => setEmailRemindersEnabled(changeEvent.target.checked)}
            />
            <span>Email me reminders before this event</span>
          </label>
          <p className="rsvp-reminder-note">
            If email is configured, we’ll send reminders 1 week, 3 days, and
            1 day before the event, plus 9 AM Los Angeles time on the event day.
            Past send times are skipped.
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
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
