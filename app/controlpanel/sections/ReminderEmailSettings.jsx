'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { fetchReminderEmailSettings, sendTestEmail } from '@/app/actions/settings/emailSettings';
import { SectionHead } from '../components/primitives';

export default function ReminderEmailSettings({ canManage, notify }) {
  const [settings, setSettings] = useState({ configured: false });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    let active = true;
    fetchReminderEmailSettings().then((loaded) => {
      if (active) setSettings(loaded);
    });
    return () => { active = false; };
  }, []);

  const test = async () => {
    setTesting(true);
    const result = await sendTestEmail();
    setTestResult(result.message);
    notify(result.sent, result.message);
    setTesting(false);
  };

  return (
    <div className="cp-setting-block">
      <SectionHead title="Event emails" />
      <p className="cp-setting-state">
        {settings.configured
          ? `SMTP settings present: ${settings.host}:${settings.port}, sending from ${settings.from}.`
          : 'SMTP is not configured on the backend. RSVP confirmations and reminders cannot be sent yet.'}
        {' '}Credentials are managed in the deployment environment.
      </p>
      {testResult && <p className="cp-setting-state">{testResult}</p>}
      <button
        type="button"
        className="cp-btn secondary"
        onClick={test}
        disabled={!canManage || !settings.configured || testing}
      >
        {testing ? 'Sending…' : 'Send test email to me'}
      </button>
    </div>
  );
}

ReminderEmailSettings.propTypes = {
  canManage: PropTypes.bool.isRequired,
  notify: PropTypes.func.isRequired,
};
