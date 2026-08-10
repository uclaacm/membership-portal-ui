'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import moment from 'moment';
import Topbar from '@/components/Topbar';
import Toast from '@/components/Toast';
import ConfirmationModal from '@/components/Modal/confirmationModal';
import SyncSheetsModal from '@/components/Modal/syncSheetsModal';
import Config from '@/lib/config';
import CookieStore from '@/lib/cookieStore';
import { isTokenSuperAdmin } from '@/lib/token';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from '@/lib/atoms';

import logoutUser from '@/app/actions/auth/logoutUser';
import changeOneClickPassword from '@/app/actions/auth/changeOneClickPassword';
import fetchAllEvents from '@/app/actions/events/fetchAllEvents';
import deleteEventAction from '@/app/actions/events/deleteEvent';
import syncEventsAction from '@/app/actions/events/syncEvents';
import fetchImages from '@/app/actions/image/fetchImages';
import deleteImageAction from '@/app/actions/image/deleteImage';
import uploadImageAction from '@/app/actions/image/uploadImage';
import fetchAdmins from '@/app/actions/user/fetchAdmins';
import fetchRoster from '@/app/actions/user/fetchRoster';
import fetchOfficers from '@/app/actions/user/fetchOfficers';
import updateUserRole from '@/app/actions/user/updateUserRole';
import fetchAuditLog from '@/app/actions/audit/fetchAuditLog';
import fetchAllCommittees from '@/app/actions/internship/fetchAllCommittees';
import fetchAllApplications from '@/app/actions/internship/fetchAllApplications';
import bulkUpdateCommitteeStatus from '@/app/actions/internship/bulkUpdateCommitteeStatus';

import ControlPanelV2, { SECTIONS, visibleSections } from './ControlPanelV2';
import AssignRoleDialog from './components/AssignRoleDialog';
import Overview from './sections/Overview';
import Users from './sections/Users';
import Roles from './sections/Roles';
import Committees from './sections/Committees';
import Events from './sections/Events';
import Media from './sections/Media';
import AuditLog from './sections/AuditLog';
import Settings from './sections/Settings';
import { formatRelative } from './format';
// ConfirmationModal and SyncSheetsModal render `.modal-wrapper`, whose styles live here.
// Without this import they render as unstyled inline text instead of an overlay.
import '@/components/Modal/style.scss';
import './style.scss';

const OVERVIEW_ACTIVITY_LIMIT = 7;

// Mirrors the multer limit on POST /image. Checked here too so an oversized file is rejected
// before it is uploaded rather than after.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function ControlPanelPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);

  const [selectedSection, setSection] = useState('overview');
  const [mounted, setMounted] = useState(false);

  // One canonical dataset. Every count in the UI — rail badges, stat tiles, section-head
  // counts, per-committee officer counts, the dialog's chip list — derives from these lists.
  // Storing any of them a second time is what produced three contradictory counts in design.
  const [roster, setRoster] = useState({
    users: [], total: 0, page: 1, pages: 0, limit: 25,
  });
  const [admins, setAdmins] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [images, setImages] = useState([]);
  const [audit, setAudit] = useState({
    entries: [], total: 0, page: 1, pages: 0,
  });
  const [overviewActivity, setOverviewActivity] = useState([]);
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');

  const [userFilters, setUserFilters] = useState({
    search: '', role: '', committee: '', page: 1,
  });
  const [auditFilters, setAuditFilters] = useState({
    search: '', action: 'all', range: '30d', page: 1,
  });

  // `seq` increments on every open so the dialog remounts with fresh state instead of
  // carrying the previous attempt's email and committee selection.
  const [assign, setAssign] = useState({
    open: false, role: 'Officer', prefill: null, seq: 0,
  });

  const openAssign = useCallback((role, user) => setAssign((a) => ({
    open: true,
    role: user ? user.role : role,
    prefill: user
      ? {
        uuid: user.uuid, email: user.email, role: user.role, committees: user.committees || [],
      }
      : null,
    seq: a.seq + 1,
  })), []);
  const [syncOpen, setSyncOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState({ showing: false, success: true, message: '' });

  const notify = useCallback((success, message) => {
    setToast({ showing: true, success, message });
    setTimeout(() => setToast((t) => ({ ...t, showing: false })), 3500);
  }, []);

  const token = mounted ? CookieStore.get('token') : null;
  const isSuperAdmin = isTokenSuperAdmin(token || '');

  // ------------------------------------------------------------------ loaders

  const loadEvents = useCallback(() => fetchAllEvents().then(setEvents), []);
  const loadImages = useCallback(() => fetchImages().then(setImages), []);

  const loadRoster = useCallback(async (filters) => {
    const result = await fetchRoster({
      search: filters.search,
      role: filters.role,
      committee: filters.committee,
      page: filters.page,
    });
    setRoster(result);
  }, []);

  const loadAudit = useCallback(async (filters, allowed) => {
    if (!allowed) {
      setAudit({
        entries: [], total: 0, page: 1, pages: 0,
      });
      return;
    }
    const result = await fetchAuditLog(filters);
    setAudit(result);
  }, []);

  // The role map and the audit log are admin-only on the API. Officers skip these calls
  // entirely rather than firing requests that can only come back 403.
  const loadRoles = useCallback(async (allowed) => {
    if (!allowed) {
      setAdmins([]);
      setOfficers([]);
      return;
    }
    // fetchAdmins is super-admin-only; a plain admin gets an empty list rather than an
    // error, so the Admins table simply shows nothing it is not allowed to see.
    const [adminList, officerList] = await Promise.all([fetchAdmins(), fetchOfficers()]);
    setAdmins(adminList);
    setOfficers(officerList);
  }, []);

  const loadInternship = useCallback(async () => {
    const [committeeResult, applicationResult] = await Promise.all([
      fetchAllCommittees(),
      fetchAllApplications(),
    ]);
    if (committeeResult.success) setCommittees(committeeResult.data);
    if (applicationResult.success) setApplications(applicationResult.data);
  }, []);

  // Everything that fetches lives inside an async init rather than the effect body: the panel
  // renders nothing until `mounted`, and the loaders are what synchronize React with the API.
  useEffect(() => {
    const init = async () => {
      setMounted(true);

      await Promise.all([loadEvents(), loadImages(), loadRoles(isAdmin), loadInternship()]);

      if (isAdmin) {
        const activity = await fetchAuditLog({ range: 'all', limit: OVERVIEW_ACTIVITY_LIMIT });
        setOverviewActivity(activity.entries);
      }

      const currentToken = CookieStore.get('token');
      if (!currentToken) return;
      try {
        const response = await fetch(`${Config.API_URL}/api/v1/sheets/info`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${currentToken}` },
        });
        const data = await response.json();
        if (data.serviceAccountEmail) setServiceAccountEmail(data.serviceAccountEmail);
      } catch {
        // The service account hint is decorative; its absence must not block the panel.
      }
    };
    init();
  }, [isAdmin, loadEvents, loadImages, loadRoles, loadInternship]);

  useEffect(() => {
    const run = async () => {
      if (mounted) await loadRoster(userFilters);
    };
    run();
  }, [mounted, userFilters, loadRoster]);

  useEffect(() => {
    const run = async () => {
      if (mounted) await loadAudit(auditFilters, isAdmin);
    };
    run();
  }, [mounted, auditFilters, isAdmin, loadAudit]);

  // If the signed-in role cannot open the selected section — including on a role change while
  // the panel is open — fall back to Overview. Derived during render rather than corrected in
  // an effect, so there is never a frame showing a section the user may not see.
  const section = visibleSections(isAdmin).some((s) => s.id === selectedSection)
    ? selectedSection
    : 'overview';

  // ------------------------------------------------------------------ actions

  const handleLogout = () => logoutUser();

  const handleAssignRole = useCallback(async ({
    uuid, email, role, committees: assigned,
  }) => {
    const result = await updateUserRole({
      uuid, email, role, committees: assigned,
    });
    if (result.success) {
      notify(true, `Role updated to ${role}.`);
      await Promise.all([loadRoles(isAdmin), loadRoster(userFilters), loadAudit(auditFilters)]);
    } else {
      notify(false, result.error || 'Could not update the role.');
    }
    return result;
  }, [notify, isAdmin, loadRoles, loadRoster, loadAudit, userFilters, auditFilters]);

  const handleDeleteEvent = (event) => setConfirm({
    title: 'Delete event',
    message: `Delete "${event.title}"? This can't be undone.`,
    run: async () => {
      const result = await deleteEventAction(event.uuid);
      if (result.success) {
        notify(true, 'Event deleted.');
        await Promise.all([loadEvents(), loadAudit(auditFilters)]);
      } else {
        notify(false, result.error ?? 'Failed to delete event.');
      }
    },
  });

  const handleDeleteImage = (image) => setConfirm({
    title: 'Delete image',
    message: (image.referenceCount ?? 0) > 0
      ? `This image is still used by ${image.referenceCount} event(s). Delete it anyway?`
      : "Delete this image? This can't be undone.",
    run: async () => {
      const result = await deleteImageAction(image.uuid);
      if (result.success) {
        notify(true, 'Image deleted.');
        await Promise.all([loadImages(), loadAudit(auditFilters)]);
      } else {
        notify(false, result.error ?? 'Failed to delete image.');
      }
    },
  });

  // Returns the raw result so SyncSheetsModal can show its own in-progress and outcome state;
  // the toast is a second signal for when the modal has already been dismissed.
  const handleSync = async (sheetUrl) => {
    const result = await syncEventsAction(sheetUrl || undefined);
    notify(!!result.success, result.message || result.error || 'Sync finished.');
    await Promise.all([loadEvents(), loadAudit(auditFilters, isAdmin)]);
    return result;
  };

  /**
   * Uploads one image and returns its previewable URL.
   *
   * The size and type checks are duplicated on the server; this copy exists to fail fast
   * without pushing several megabytes over the wire first.
   */
  const handleUploadImage = async (file) => {
    if (!file) return { success: false, error: 'No file selected.' };
    if (!file.type.startsWith('image/')) {
      return { success: false, error: `${file.name} is not an image.` };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        success: false,
        error: `${file.name} is ${(file.size / (1024 * 1024)).toFixed(1)} MB — the limit is 5 MB.`,
      };
    }

    const formData = new FormData();
    formData.append('image', file);
    const result = await uploadImageAction(formData);

    if (result.success) {
      notify(true, 'Image uploaded.');
      await Promise.all([loadImages(), loadAudit(auditFilters, isAdmin)]);
      return { ...result, url: `${Config.API_URL}${Config.routes.image.specific}/${result.uuid}` };
    }
    notify(false, result.error || 'Upload failed.');
    return result;
  };

  const handleRotatePassword = async (oldPassword, newPassword) => {
    const result = await changeOneClickPassword(oldPassword, newPassword);
    notify(result.success, result.success ? 'Password rotated.' : (result.error || 'Rotation failed.'));
    if (result.success) await loadAudit(auditFilters);
  };

  const handleToggleRecruitment = (committee) => setConfirm({
    title: committee.isActive ? 'Close recruitment' : 'Open recruitment',
    message: `${committee.isActive ? 'Close' : 'Open'} recruitment for ${committee.displayName}?`,
    run: async () => {
      const result = await bulkUpdateCommitteeStatus({
        action: committee.isActive ? 'close' : 'open',
        committeeIds: [committee.id],
      });
      notify(result.success, result.success ? 'Recruitment updated.' : result.error);
      await Promise.all([loadInternship(), loadAudit(auditFilters)]);
    },
  });

  const handleCloseAll = () => setConfirm({
    title: 'Close all recruitment',
    message: 'Close recruitment for every committee?',
    run: async () => {
      const result = await bulkUpdateCommitteeStatus({ action: 'close' });
      notify(result.success, result.success ? 'All recruitment closed.' : result.error);
      await Promise.all([loadInternship(), loadAudit(auditFilters)]);
    },
  });

  const handleRevoke = (user) => setConfirm({
    title: 'Revoke role',
    message: `Revoke ${user.firstName} ${user.lastName}'s elevated access? They become a standard member.`,
    run: () => handleAssignRole({ uuid: user.uuid, role: 'Member' }),
  });

  // ------------------------------------------------------------ derived counts

  const counts = useMemo(() => ({
    users: roster.total,
    roles: admins.length + officers.length,
    committees: Config.committees.length,
    events: events.length,
    media: images.length,
  }), [roster.total, admins.length, officers.length, events.length, images.length]);

  const system = useMemo(() => {
    const rotation = overviewActivity.find((e) => e.action === 'settings.update');
    const sync = overviewActivity.find((e) => e.action === 'events.sync');
    const openCommittees = committees.filter((c) => c.isActive);
    const nextDeadline = openCommittees
      .map((c) => c.applicationDeadline)
      .filter(Boolean)
      .sort()[0];

    return {
      oneClickRotated: rotation
        ? `Rotated ${formatRelative(rotation.createdAt)} by ${rotation.actorName}.`
        : 'No rotation recorded yet.',
      lastSync: sync
        ? `Last sync ${formatRelative(sync.createdAt)} — ${sync.detail}`
        : 'No sync recorded yet.',
      recruitment: openCommittees.length > 0
        ? `Open · ${openCommittees.length} committee${openCommittees.length === 1 ? '' : 's'}${nextDeadline ? ` · closes ${moment(nextDeadline).format('MMM D')}` : ''}`
        : 'Closed',
      cycleName: `${moment().year()} cycle`,
      cycleOpen: openCommittees.length > 0,
    };
  }, [overviewActivity, committees]);

  if (!mounted) return null;

  const canManageAdmins = isSuperAdmin;
  const canManage = isAdmin;

  const sectionTitle = SECTIONS.find((s) => s.id === section)?.label ?? 'Control Panel';

  const renderSection = () => {
    switch (section) {
      case 'users':
        return (
          <Users
            data={{
              users: roster.users,
              memberTotal: roster.total,
              page: roster.page,
              pages: roster.pages,
              limit: roster.limit,
            }}
            filters={userFilters}
            canManageRoles={isAdmin}
            onFiltersChange={setUserFilters}
            onAssignRole={handleAssignRole}
            onEditUser={(user) => openAssign(user.role, user)}
          />
        );
      case 'roles':
        return (
          <Roles
            admins={admins}
            officers={officers}
            canManageAdmins={canManageAdmins}
            onOpenAssign={openAssign}
            onRevoke={handleRevoke}
          />
        );
      case 'committees':
        return (
          <Committees
            committees={committees}
            admins={admins}
            officers={officers}
            events={events}
            canManage={canManage}
            onToggleRecruitment={handleToggleRecruitment}
            onCloseAll={handleCloseAll}
          />
        );
      case 'events':
        return (
          <Events
            events={events}
            lastSync={system.lastSync}
            canSync={canManage}
            onSync={() => setSyncOpen(true)}
            onDelete={handleDeleteEvent}
          />
        );
      case 'media':
        return (
          <Media
            images={images}
            canUpload={isAdmin || isOfficer}
            maxBytes={MAX_UPLOAD_BYTES}
            onUpload={handleUploadImage}
            onDelete={handleDeleteImage}
          />
        );
      case 'audit':
        return (
          <AuditLog
            entries={audit.entries}
            total={audit.total}
            page={audit.page}
            pages={audit.pages}
            filters={auditFilters}
            onFiltersChange={setAuditFilters}
          />
        );
      case 'settings':
        return (
          <Settings
            serviceAccountEmail={serviceAccountEmail}
            system={system}
            canManage={canManage}
            onRotatePassword={handleRotatePassword}
            onSync={() => setSyncOpen(true)}
            onCloseCycle={handleCloseAll}
          />
        );
      default:
        return (
          <Overview
            data={{
              memberTotal: roster.total,
              admins,
              officers,
              events,
              images,
              applications,
              audit: overviewActivity,
              system,
            }}
            isAdmin={isAdmin}
            onNavigate={setSection}
          />
        );
    }
  };

  return (
    <>
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView((v) => !v)}
        isOfficer={isOfficer}
        officerView={adminView}
        onToggleOfficerView={() => setAdminView((v) => !v)}
      />

      <ControlPanelV2
        section={section}
        onSectionChange={setSection}
        counts={counts}
        isAdmin={isAdmin}
        adminView={adminView}
        onToggleView={() => setAdminView((v) => !v)}
        onLogout={handleLogout}
      >
        {renderSection()}
      </ControlPanelV2>

      <Toast showing={toast.showing} success={toast.success} message={toast.message} />

      <AssignRoleDialog
        key={assign.seq}
        open={assign.open}
        initialRole={assign.role}
        prefill={assign.prefill}
        onClose={() => setAssign((a) => ({ ...a, open: false }))}
        onAssign={handleAssignRole}
      />

      <SyncSheetsModal
        opened={syncOpen}
        onClose={() => setSyncOpen(false)}
        onSync={handleSync}
        serviceAccountEmail={serviceAccountEmail}
      />

      <ConfirmationModal
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        opened={!!confirm}
        cancel={() => setConfirm(null)}
        submit={async () => {
          const pending = confirm;
          setConfirm(null);
          if (pending) await pending.run();
        }}
      />
    </>
  );
}
