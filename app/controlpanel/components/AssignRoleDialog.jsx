'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import ModalShell from '@/components/Modal/ModalShell';

const ROLES = ['Member', 'Officer', 'Admin'];

/**
 * Assign-role dialog, opened from "+ Add admin" / "+ Add officer".
 *
 * The committee chips come from `committeeOptions`, the committee records in the database, never
 * a local copy. A hardcoded list here previously offered committees with no record, and officers
 * assigned to them hit "Could not find a committee matching ..." on their dashboard.
 *
 * State is reset by remounting: the caller passes a `key` that changes each time the dialog
 * opens, so a previous attempt cannot leak into the next one and no reset effect is needed.
 */
export default function AssignRoleDialog({
  open, initialRole = 'Officer', prefill = null, onClose, onAssign, committeeOptions,
}) {
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [role, setRole] = useState(prefill?.role ?? initialRole);
  const [committees, setCommittees] = useState(prefill?.committees ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const toggleCommittee = (committee) => {
    setCommittees((current) => (current.includes(committee)
      ? current.filter((c) => c !== committee)
      : [...current, committee]));
  };

  const submit = async () => {
    if (!email.trim()) {
      setError('An email is required.');
      return;
    }
    if (role === 'Officer' && committees.length === 0) {
      setError('An officer needs at least one committee.');
      return;
    }

    setSaving(true);
    setError('');
    // Prefer the uuid when editing an existing row: it survives an email edit in the field and
    // avoids a lookup round trip.
    const result = await onAssign({
      uuid: prefill?.uuid, email: email.trim(), role, committees,
    });
    setSaving(false);

    if (result && result.success) onClose();
    else setError((result && result.error) || 'Could not assign the role.');
  };

  return (
    <ModalShell title="Assign role" onClose={onClose}>
      <div className="cp-dialog cp-dialog--embedded">

        <div>
          <label className="cp-field-label" htmlFor="cp-assign-email">Email</label>
          <input
            id="cp-assign-email"
            type="email"
            value={email}
            placeholder="name@g.ucla.edu"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <span className="cp-field-label">Role</span>
          <div className="cp-segmented">
            {ROLES.map((option) => (
              <button
                key={option}
                type="button"
                className={role === option ? 'selected' : ''}
                onClick={() => setRole(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {role !== 'Member' && (
          <div>
            <span className="cp-field-label">Committees</span>
            <div className="cp-chip-group">
              {committeeOptions.map(({ name, displayName }) => (
                <button
                  key={name}
                  type="button"
                  className={`cp-chip ${committees.includes(name) ? 'selected' : ''}`}
                  onClick={() => toggleCommittee(name)}
                >
                  {displayName || name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="cp-dialog-error">{error}</div>}

        <div className="cp-dialog-footer">
          <button type="button" className="cp-btn secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="cp-btn primary" onClick={submit} disabled={saving}>
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

AssignRoleDialog.propTypes = {
  committeeOptions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    displayName: PropTypes.string,
  })).isRequired,
  open: PropTypes.bool.isRequired,
  initialRole: PropTypes.string,
  prefill: PropTypes.shape({
    uuid: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    committees: PropTypes.arrayOf(PropTypes.string),
  }),
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};
