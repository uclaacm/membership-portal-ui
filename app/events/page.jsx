'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';
import Topbar from '@/components/Topbar';
import UserEvents from './UserEvents';
import AdminEvents from './AdminEvents';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchAllEvents from '@/app/actions/events/fetchAllEvents';
import createEvent from '@/app/actions/events/createEvent';
import createRepeatedEvent from '@/app/actions/events/createRepeatedEvent';
import updateEvent from '@/app/actions/events/updateEvent';
import updateRepeatedEventGroup from '@/app/actions/events/updateRepeatedEventGroup';
import deleteEvent from '@/app/actions/events/deleteEvent';
import deleteRepeatedEventGroup from '@/app/actions/events/deleteRepeatedEventGroup';
import fetchRepeatedEventGroup from '@/app/actions/events/fetchRepeatedEventGroup';
import fetchUserRSVPs from '@/app/actions/rsvp/fetchUserRSVPs';
import checkInAction from '@/app/actions/attendance/checkIn';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from '@/lib/atoms';
import './style.scss';

export default function EventsPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [officerView, setOfficerView] = useAtom(officerViewAtom);
  const [events, setEvents] = useState([]);
  const [userRsvps, setUserRsvps] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [eventUpdated, setEventUpdated] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [repeatedSeriesCreate, setRepeatedSeriesCreate] = useState(false);
  const [repeatedSeriesUpdate, setRepeatedSeriesUpdate] = useState(false);
  const [eventDeleted, setEventDeleted] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteWasSeries, setDeleteWasSeries] = useState(false);
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInPoints, setCheckInPoints] = useState(0);
  const [checkInError, setCheckInError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setMounted(true);
      try {
        const [eventsArray, rsvpResult] = await Promise.all([
          fetchAllEvents(),
          fetchUserRSVPs(),
        ]);

        setEvents(eventsArray.map(e => ({
          ...e,
          startDate: moment(e.startDate),
          endDate: moment(e.endDate),
        })));

        if (!rsvpResult.error) {
          setUserRsvps(rsvpResult.rsvps || []);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events');
      }
    };

    loadEvents();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  const handleCheckIn = async (attendanceCode) => {
    const result = await checkInAction(attendanceCode);
    setCheckInSubmitted(true);
    setCheckInSuccess(result.success);
    setCheckInPoints(result.points ?? 0);
    setCheckInError(result.error ?? '');
  };

  const handleResetCheckIn = () => {
    setCheckInSubmitted(false);
    setCheckInSuccess(false);
    setCheckInPoints(0);
    setCheckInError('');
  };

  const normalizeEventForServer = (event) => ({
    ...event,
    startDate: event.startDate ? event.startDate.toISOString?.() ?? event.startDate : null,
    endDate: event.endDate ? event.endDate.toISOString?.() ?? event.endDate : null,
  });

  const refreshEvents = async () => {
    const eventsArray = await fetchAllEvents();
    setEvents(eventsArray.map(e => ({
      ...e,
      startDate: moment(e.startDate),
      endDate: moment(e.endDate),
    })));
  };

  const handleAddEvent = async (event) => {
    setEventCreated(false);
    setCreateSuccess(false);
    setRepeatedSeriesCreate(false);
    setError(null);

    const result = await createEvent(normalizeEventForServer(event));
    setEventCreated(true);
    setCreateSuccess(result.success);
    if (!result.success) {
      setError(result.error ?? 'Failed to create event');
    } else {
      await refreshEvents();
    }
  };

  const handleAddRepeatedEvent = async (event, recurrence) => {
    setEventCreated(false);
    setCreateSuccess(false);
    setRepeatedSeriesCreate(false);
    setError(null);

    const payload = normalizeEventForServer({ ...event });
    delete payload.uuid;
    delete payload.eventGroupId;
    delete payload.attendanceCode;
    if (payload.attendancePoints === '' || payload.attendancePoints == null) {
      payload.attendancePoints = 1;
    } else {
      payload.attendancePoints = Number(payload.attendancePoints);
    }

    const result = await createRepeatedEvent(payload, recurrence);
    setEventCreated(true);
    setCreateSuccess(result.success);
    setRepeatedSeriesCreate(!!result.success);
    if (!result.success) {
      setError(result.error ?? 'Failed to create repeated events');
    } else {
      await refreshEvents();
    }
  };

  const handleUpdateEvent = async (event) => {
    setEventUpdated(false);
    setUpdateSuccess(false);
    setRepeatedSeriesUpdate(false);
    setError(null);

    const result = await updateEvent(normalizeEventForServer(event));
    setEventUpdated(true);
    setUpdateSuccess(result.success);
    if (!result.success) {
      setError(result.error ?? 'Failed to update event');
    } else {
      await refreshEvents();
    }
  };

  const handleUpdateRepeatedGroup = async (eventGroupId, scope, fromUuid, eventFields) => {
    setEventUpdated(false);
    setUpdateSuccess(false);
    setRepeatedSeriesUpdate(false);
    setError(null);

    const body = normalizeEventForServer({ ...eventFields });
    delete body.uuid;
    delete body.eventGroupId;

    const result = await updateRepeatedEventGroup(eventGroupId, {
      scope,
      fromUuid: scope === 'fromInstance' ? fromUuid : undefined,
      event: body,
    });
    setEventUpdated(true);
    setUpdateSuccess(result.success);
    setRepeatedSeriesUpdate(!!result.success);
    if (!result.success) {
      setError(result.error ?? 'Failed to update repeated events');
    } else {
      await refreshEvents();
    }
  };

  const handleDeleteAdminEvent = async (payload) => {
    setEventDeleted(false);
    setDeleteSuccess(false);
    setDeleteWasSeries(false);
    setError(null);

    let result;
    if (payload.kind === 'single') {
      result = await deleteEvent(payload.uuid);
    } else {
      result = await deleteRepeatedEventGroup(payload.eventGroupId, {
        scope: payload.scope,
        fromUuid: payload.scope === 'fromInstance' ? payload.fromUuid : undefined,
      });
    }

    setEventDeleted(true);
    setDeleteSuccess(result.success);
    setDeleteWasSeries(payload.kind === 'group' && result.success);
    if (!result.success) {
      setError(result.error ?? 'Failed to delete event');
    } else {
      await refreshEvents();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="events">
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView(v => !v)}
        isOfficer={isOfficer}
        officerView={adminView}
        onToggleOfficerView={() => setAdminView(v => !v)}
      />
      {(isAdmin || isOfficer) && adminView ? (
        <AdminEvents
          events={events}
          error={error}
          isAdmin={isAdmin}
          isOfficer={isOfficer}
          addEvent={handleAddEvent}
          addRepeatedEvent={handleAddRepeatedEvent}
          updateEvent={handleUpdateEvent}
          updateRepeatedGroup={handleUpdateRepeatedGroup}
          deleteAdminEvent={handleDeleteAdminEvent}
          loadRepeatedGroup={fetchRepeatedEventGroup}
          created={eventCreated}
          createSuccess={createSuccess}
          repeatedSeriesCreate={repeatedSeriesCreate}
          updated={eventUpdated}
          updateSuccess={updateSuccess}
          repeatedSeriesUpdate={repeatedSeriesUpdate}
          deleted={eventDeleted}
          deleteSuccess={deleteSuccess}
          deleteWasSeries={deleteWasSeries}
        />
      ) : (
        <UserEvents
          events={events}
          userRsvps={userRsvps}
          error={error}
          checkIn={handleCheckIn}
          checkInSubmitted={checkInSubmitted}
          checkInSuccess={checkInSuccess}
          checkInPoints={checkInPoints}
          checkInError={checkInError}
          resetCheckIn={handleResetCheckIn}
        />
      )}
    </div>
  );
}
