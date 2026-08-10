'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { PageHeader, SectionHead, Pill, ApiLegend } from '../components/primitives';

export default function Settings({
  serviceAccountEmail, system, canManage, onRotatePassword, onSync, onCloseCycle,
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [rotating, setRotating] = useState(false);

  const rotate = async () => {
    setRotating(true);
    await onRotatePassword(oldPassword, newPassword);
    setRotating(false);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Portal-wide configuration and integrations."
      />

      <div className="cp-settings">
        <div className="cp-setting-block">
          <SectionHead title="One-click attendance API" />
          <p className="cp-setting-state">{system.oneClickRotated}</p>

          <div className="cp-field narrow">
            <label className="cp-field-label" htmlFor="cp-old-password">Current password</label>
            <input
              id="cp-old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="cp-field narrow">
            <label className="cp-field-label" htmlFor="cp-new-password">New password</label>
            <input
              id="cp-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="cp-btn primary"
            onClick={rotate}
            disabled={!canManage || rotating || !oldPassword || !newPassword}
          >
            {rotating ? 'Rotating…' : 'Rotate password'}
          </button>
        </div>

        <div className="cp-setting-block">
          <SectionHead title="Google Sheets sync" />
          <p className="cp-setting-state">{system.lastSync}</p>

          <div className="cp-field wide">
            <label className="cp-field-label" htmlFor="cp-sheet-url">Spreadsheet URL</label>
            <input
              id="cp-sheet-url"
              type="url"
              value={sheetUrl}
              placeholder="https://docs.google.com/spreadsheets/…"
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>

          {serviceAccountEmail && (
            <p className="cp-service-account">
              Share the sheet with <code>{serviceAccountEmail}</code>
            </p>
          )}

          <button
            type="button"
            className="cp-btn secondary"
            onClick={() => onSync(sheetUrl)}
            disabled={!canManage}
          >
            Sync now
          </button>
        </div>

        <div className="cp-setting-block">
          <SectionHead title="Recruitment cycle" />
          <div className="cp-cycle-row">
            <span>{system.cycleName}</span>
            {system.cycleOpen
              ? <Pill tone="success">Open</Pill>
              : <Pill tone="muted">Closed</Pill>}
            <span className="cp-cycle-meta">{system.recruitment}</span>
            <button
              type="button"
              className="cp-btn danger small"
              onClick={onCloseCycle}
              disabled={!canManage || !system.cycleOpen}
            >
              Close cycle
            </button>
          </div>
        </div>
      </div>

      <ApiLegend />
    </>
  );
}

Settings.propTypes = {
  serviceAccountEmail: PropTypes.string,
  system: PropTypes.object.isRequired,
  canManage: PropTypes.bool.isRequired,
  onRotatePassword: PropTypes.func.isRequired,
  onSync: PropTypes.func.isRequired,
  onCloseCycle: PropTypes.func.isRequired,
};

Settings.defaultProps = { serviceAccountEmail: '' };
