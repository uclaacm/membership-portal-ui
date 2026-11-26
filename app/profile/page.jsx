'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import Profile from './profile';
import moment from 'moment';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchActivity from '@/app/actions/user/fetchActivity';
import updateUser from '@/app/actions/user/updateUser';
import updateEventReminderEmails from '@/app/actions/user/updateEventReminderEmails';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from '@/lib/atoms';
import './style.scss';

export default function ProfilePage() {
  const [userProfile, setAuthUserProfile] = useAtom(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [activity, setActivity] = useState(null);
  const [activityError, setActivityError] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [emailPreferenceSaving, setEmailPreferenceSaving] = useState(false);
  const [emailPreferenceMessage, setEmailPreferenceMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      setMounted(true);
      try {
        const data = await fetchActivity();
        if (data) setActivity(data.map(a => ({ ...a, date: moment(a.date) })));
        else setActivityError('Failed to load activity');
      } catch {
        setActivityError('Failed to load activity');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (mounted && window.location.hash === '#event-email-preferences') {
      requestAnimationFrame(() => document.getElementById('event-email-preferences')?.scrollIntoView());
    }
  }, [mounted, userProfile]);

  const handleSaveChanges = async (newProfile) => {
    const result = await updateUser(newProfile);
    if (result.success) {
      setAuthUserProfile(prev => ({ ...(prev || {}), ...newProfile }));
    }
    setUpdated(true);
    setUpdateSuccess(result.success);
    setUpdateError(result.error ?? null);
    setTimeout(() => setUpdated(false), 3000);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleEmailPreferenceChange = async (enabled) => {
    setEmailPreferenceSaving(true);
    setEmailPreferenceMessage('');
    const result = await updateEventReminderEmails(enabled);
    if (result.success) {
      setAuthUserProfile(prev => ({ ...(prev || {}), eventReminderEmailsEnabled: enabled }));
      setEmailPreferenceMessage(enabled ? 'Event reminders are on.' : 'Event reminders are off.');
    } else {
      setEmailPreferenceMessage(result.error || 'Could not update email preference.');
    }
    setEmailPreferenceSaving(false);
  };

  if (!mounted) return null;

  const profile = userProfile ? {
    name: `${userProfile.firstName} ${userProfile.lastName}`,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    major: userProfile.major,
    year: userProfile.year,
    points: userProfile.points,
    picture: userProfile.picture,
    eventReminderEmailsEnabled: userProfile.eventReminderEmailsEnabled !== false,
  } : {};

  return (
    <div className="profile">
      <Topbar
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        isOfficer={isOfficer}
      />
      <Profile
        profile={profile}
        updated={updated}
        updateSuccess={updateSuccess}
        updateError={updateError}
        saveChanges={handleSaveChanges}
        emailPreferenceSaving={emailPreferenceSaving || !userProfile}
        emailPreferenceMessage={emailPreferenceMessage}
        onEmailPreferenceChange={handleEmailPreferenceChange}
        logout={handleLogout}
        activity={activity}
        activityError={activityError}
        isAdmin={isAdmin}
      />
    </div>
  );
}
