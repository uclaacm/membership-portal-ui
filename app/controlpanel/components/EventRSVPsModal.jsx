'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import fetchEventRSVPs from '@/app/actions/rsvp/fetchEventRSVPs';
import fetchEventCheckIns from '@/app/actions/attendance/fetchEventCheckIns';
import { formatCount } from '../format';
import ModalShell from '@/components/Modal/ModalShell';

// What each `kind` of list shows, and where it loads from.
const KINDS = {
  rsvps: {
    title: 'RSVPs',
    noun: 'RSVP',
    empty: 'Nobody has RSVPed to this event yet.',
    load: async (uuid) => {
      const result = await fetchEventRSVPs(uuid);
      return { ...result, records: result.rsvps };
    },
    lastColumn: 'Status',
    lastCell: (record) => (record.attended ? 'Checked in' : 'RSVPed'),
  },
  checkins: {
    title: 'Check-ins',
    noun: 'check-in',
    empty: 'Nobody has checked in to this event yet.',
    load: async (uuid) => {
      const result = await fetchEventCheckIns(uuid);
      return { ...result, records: result.attendance };
    },
    lastColumn: 'Checked in at',
    lastCell: (record) => (record.date ? moment(record.date).format('MMM D, h:mm a') : '—'),
  },
};

/**
 * Attendee list for one event: who RSVPed (GET /rsvp/event/:uuid) or, with kind="checkins",
 * who checked in with the attendance code (GET /attendance/:uuid).
 *
 * Fetches on open rather than with the events list: these are only ever looked at one event at
 * a time, and the list endpoint already returns the counts the table needs.
 */
export default function EventRSVPsModal({ event = null, onClose, kind = 'rsvps' }) {
  const config = KINDS[kind];
  const [state, setState] = useState({ loading: true, rsvps: [], error: '' });

  useEffect(() => {
    if (!event) return undefined;

    // Guards against a slow response for a previously-opened event overwriting the current one.
    let active = true;
    const load = async () => {
      setState({ loading: true, rsvps: [], error: '' });
      const result = await config.load(event.uuid);
      if (!active) return;
      setState({
        loading: false,
        rsvps: result.records ?? [],
        error: result.success ? '' : (result.error || `Could not load ${config.title}.`),
      });
    };
    load();

    return () => { active = false; };
  }, [event, config]);

  if (!event) return null;

  const { loading, rsvps, error } = state;

  return (
    <ModalShell
      title={config.title}
      subtitle={event.title}
      onClose={onClose}
      wide
      footer={<button type="button" className="modal-action" onClick={onClose}>Close</button>}
    >
      <div className="attendance-summary" aria-live="polite">
        <span className="attendance-count">
          {loading ? 'Loading…' : error ? 'Unavailable' : `${formatCount(rsvps.length)} ${config.noun}${rsvps.length === 1 ? '' : 's'}`}
        </span>
        {!loading && kind === 'rsvps' && event.capacity ? <span>Capacity {formatCount(event.capacity)}</span> : null}
      </div>
      {error && <p className="modal-feedback is-error" role="alert">{error}</p>}
      {loading && <p className="modal-state" role="status">Loading {config.title.toLowerCase()}…</p>}
      {!loading && !error && rsvps.length === 0 && <p className="modal-state">{config.empty}</p>}
      {!loading && rsvps.length > 0 && (
        <div className="attendance-table-scroll">
          <table className="attendance-table">
            <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">{config.lastColumn}</th></tr></thead>
            <tbody>
              {rsvps.map((rsvp) => {
                const user = rsvp.user || rsvp;
                return (
                  <tr key={rsvp.uuid || user.uuid || user.email}>
                    <td>{user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—'}</td>
                    <td>{user.email || '—'}</td>
                    <td>{kind === 'rsvps' ? <span className={`attendance-status${rsvp.attended ? ' is-attended' : ''}`}>{config.lastCell(rsvp)}</span> : config.lastCell(rsvp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ModalShell>
  );
}

EventRSVPsModal.propTypes = {
  event: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  kind: PropTypes.oneOf(['rsvps', 'checkins']),
};
