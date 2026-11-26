'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Switch from '@/components/Switch';
import './rsvpReminderModal.scss';

export default function RSVPReminderModal({ event, remindersAllowed, onConfirm, onClose }) {
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const checkboxRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (remindersAllowed) checkboxRef.current?.focus();
    else confirmButtonRef.current?.focus();
  }, [remindersAllowed]);

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
          <Switch
            className="rsvp-reminder-option"
            inputRef={checkboxRef}
            checked={emailRemindersEnabled}
            disabled={!remindersAllowed}
            onChange={setEmailRemindersEnabled}
            label="Email me a reminder before this event"
          />
          <p className="rsvp-reminder-note">
            {remindersAllowed ? (
              emailRemindersEnabled
                ? <>You will receive an email reminder one day before the event.</>
                : <>Turn this on to receive an email reminder one day before the event.</>
            ) : (
              <>Event reminders are off for your account. <Link href="/profile#event-email-preferences">Manage email preferences</Link>.</>
            )}
          </p>
          {error && <p className="rsvp-reminder-error" role="alert">{error}</p>}
          <div className="rsvp-reminder-actions">
            <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
            <button ref={confirmButtonRef} type="submit" className="is-primary" disabled={submitting}>
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
