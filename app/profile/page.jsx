'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import Profile from './profile';
import moment from 'moment';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchActivity from '@/app/actions/user/fetchActivity';
import updateUser from '@/app/actions/user/updateUser';
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

  const handleSaveChanges = async (newProfile) => {
    setUpdated(false);
    let saved = false;
    try {
      const basicChanged = ['firstName', 'lastName', 'year', 'major'].some(key => String(newProfile[key]) !== String(userProfile?.[key]));
      if (basicChanged) {
        const result = await updateUser(newProfile);
        if (!result.success) throw new Error(typeof result.error === 'string' ? result.error : 'Unable to save your information.');
        setAuthUserProfile(prev => ({ ...(prev || {}), ...newProfile }));
      }
      saved = true;
      setUpdateSuccess(true);
      setUpdateError(null);
    } catch (error) {
      setUpdateSuccess(false);
      setUpdateError(error.message || 'Unable to save your profile. Please try again.');
    }
    setUpdated(true);
    setTimeout(() => setUpdated(false), 3000);
    return saved;
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const profile = useMemo(() => userProfile ? {
    ...userProfile,
    name: `${userProfile.firstName} ${userProfile.lastName}`,
  } : {}, [userProfile]);

  if (!mounted) return null;

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
        logout={handleLogout}
        activity={activity}
        activityError={activityError}
        isAdmin={isAdmin}
      />
    </div>
  );
}
