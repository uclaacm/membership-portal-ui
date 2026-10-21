'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import ModalShell from '@/components/Modal/ModalShell';
import './checkInModal.scss';

/**
 * Member check-in.
 *
 * The shared modal frame handles dismissal, keyboard focus, and page scroll locking.
 */
export default function CheckInModal({ onClose, onSubmit }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const res = await onSubmit(code.trim());
      setResult(res?.success
        ? { ok: true, message: `Checked in — ${res.points ?? 0} points added.` }
        : { ok: false, message: res?.error || 'That code did not match an event.' });
      if (res?.success) setCode('');
    } catch {
      setResult({ ok: false, message: 'Could not check in. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Event check-in"
      subtitle="Enter the code shown at the event to claim your points."
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="modal-action" onClick={onClose}>Cancel</button>
          <button type="submit" form="event-checkin-form" className="modal-action modal-action--primary" disabled={busy || !code.trim()}>
            {busy ? 'Checking in…' : 'Check in'}
          </button>
        </>
      )}
    >
      <form id="event-checkin-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label className="modal-field" htmlFor="attendance-code">Attendance code</label>
        <input
          id="attendance-code"
          className="modal-input checkin-input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter your code"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
        />
        <p className="checkin-hint">Ask an event organizer if you need the code.</p>
        {result && <p role={result.ok ? 'status' : 'alert'} className={`modal-feedback ${result.ok ? 'is-ok' : 'is-error'}`}>{result.message}</p>}
      </form>
    </ModalShell>
  );
}

CheckInModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
