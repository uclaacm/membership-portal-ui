"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import fetchAllApplications from "@/app/actions/internship/fetchAllApplications";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import ApplicationDetailDrawer from "@/app/internship/components/ApplicationDetailDrawer";
import ApplicationTable from "@/app/internship/components/ApplicationTable";
import CopyEmailsButton from "@/app/internship/components/CopyEmailsButton";
import OfficerFilterBar from "@/app/internship/components/OfficerFilterBar";
import OfficerStatsBar from "@/app/internship/components/OfficerStatsBar";
import Toast from "@/components/Toast";
import useDebouncedValue from "@/lib/hooks/useDebouncedValue";
import { authUserProfileAtom, officerApplicationsAtom } from "@/lib/atoms";
import "./OfficerDashboard.scss";

const CHOICE_FIELDS = [
  {
    rank: 1,
    committeeField: "firstChoiceCommittee",
    statusField: "firstChoiceStatus",
    responsesField: "firstChoiceResponses",
    officer1RatingField: "firstChoiceOfficer1Rating",
    officer2RatingField: "firstChoiceOfficer2Rating",
    notesField: "firstChoiceNotes",
  },
  {
    rank: 2,
    committeeField: "secondChoiceCommittee",
    statusField: "secondChoiceStatus",
    responsesField: "secondChoiceResponses",
    officer1RatingField: "secondChoiceOfficer1Rating",
    officer2RatingField: "secondChoiceOfficer2Rating",
    notesField: "secondChoiceNotes",
  },
  {
    rank: 3,
    committeeField: "thirdChoiceCommittee",
    statusField: "thirdChoiceStatus",
    responsesField: "thirdChoiceResponses",
    officer1RatingField: "thirdChoiceOfficer1Rating",
    officer2RatingField: "thirdChoiceOfficer2Rating",
    notesField: "thirdChoiceNotes",
  },
];

const EMPTY_STATUS_COUNTS = {
  pending: 0,
  reviewing: 0,
  interview_scheduled: 0,
  accepted: 0,
  rejected: 0,
};

function getCurrentApplicationCycle() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

function normalizeCommitteeName(name) {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

// Each application can list up to 3 committee choices; an officer only cares
// about the single slot (if any) that matches their own committee. The API
// already strips response arrays for the other slots — this just picks out
// the one slot that's actually theirs to look at.
function enrichForCommittee(application, committeeId) {
  const match = CHOICE_FIELDS.find((choice) => application[choice.committeeField] === committeeId);
  if (!match) return null;
  return {
    ...application,
    myChoiceRank: match.rank,
    myStatusField: match.statusField,
    myStatus: application[match.statusField],
    myResponses: Array.isArray(application[match.responsesField]) ? application[match.responsesField] : [],
    myOfficer1RatingField: match.officer1RatingField,
    myOfficer1Rating: application[match.officer1RatingField] ?? null,
    myOfficer2RatingField: match.officer2RatingField,
    myOfficer2Rating: application[match.officer2RatingField] ?? null,
    myNotesField: match.notesField,
    myNotes: application[match.notesField] ?? "",
  };
}

export default function OfficerDashboard() {
  const authProfile = useAtomValue(authUserProfileAtom);
  const officerCommitteeName = normalizeCommitteeName(
    authProfile && "committees" in authProfile ? authProfile.committees?.[0] : undefined,
  );

  const [committees, setCommittees] = useState([]);
  const [applications, setApplications] = useAtom(officerApplicationsAtom);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [choiceFilter, setChoiceFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [toast, setToast] = useState({ key: 0, message: "", success: true, visible: false });

  const showToast = useCallback((message, success) => {
    setToast((prev) => ({ key: prev.key + 1, message, success, visible: true }));
  }, []);

  // The Toast component re-arms its hide timer on every prop update where
  // `showing` is true (not just on a false->true transition), so it must be
  // flipped back to false explicitly here rather than left permanently true —
  // otherwise unrelated re-renders (e.g. typing in the search box) would keep
  // resetting its internal timer and it would never disappear.
  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
    return () => clearTimeout(timer);
  }, [toast.key, toast.visible]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadStatus("loading");
      const [committeesResult, applicationsResult] = await Promise.all([
        fetchAllCommittees(),
        fetchAllApplications(),
      ]);

      if (cancelled) return;

      if (!committeesResult.success) {
        setLoadError(committeesResult.error);
        setLoadStatus("error");
        return;
      }
      if (!applicationsResult.success) {
        setLoadError(applicationsResult.error);
        setLoadStatus("error");
        return;
      }

      setCommittees(committeesResult.data);
      setApplications(applicationsResult.data);
      setLoadError(null);
      setLoadStatus("success");
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [setApplications]);

  const myCommittee = useMemo(() => committees.find((committee) => (
    normalizeCommitteeName(committee.displayName) === officerCommitteeName
    || normalizeCommitteeName(committee.name) === officerCommitteeName
  )), [committees, officerCommitteeName]);

  const recruitmentCycle = applications[0]?.applicationCycle ?? getCurrentApplicationCycle();

  // Recomputed only when the raw application list or the officer's committee
  // changes — filtering below runs against this instead of re-deriving
  // rank/status/responses on every keystroke or filter change.
  const enrichedApplications = useMemo(() => {
    if (!myCommittee) return [];
    return applications
      .map((application) => enrichForCommittee(application, myCommittee.id))
      .filter(Boolean);
  }, [applications, myCommittee]);

  const statusCounts = useMemo(() => {
    const counts = { ...EMPTY_STATUS_COUNTS };
    enrichedApplications.forEach((application) => {
      if (application.myStatus in counts) counts[application.myStatus] += 1;
    });
    return counts;
  }, [enrichedApplications]);

  const filteredApplications = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return enrichedApplications.filter((application) => {
      if (statusFilter !== "all" && application.myStatus !== statusFilter) return false;
      if (choiceFilter !== "all" && String(application.myChoiceRank) !== choiceFilter) return false;
      if (term) {
        const haystack = `${application.firstName ?? ""} ${application.lastName ?? ""} ${application.email ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [enrichedApplications, statusFilter, choiceFilter, debouncedSearch]);

  const selectedApplication = useMemo(
    () => enrichedApplications.find((application) => application._id === selectedApplicationId) ?? null,
    [enrichedApplications, selectedApplicationId],
  );

  // Writes through the shared atom, so the table and the drawer — both
  // reading from the same atom — reflect a status/rating/notes change
  // immediately, regardless of which one triggered it.
  const handleApplicationChanged = useCallback((applicationId, updatedApplication) => {
    setApplications((prev) => prev.map((application) => (
      application._id === applicationId ? { ...application, ...updatedApplication } : application
    )));
  }, [setApplications]);

  const handleCopied = useCallback((count) => {
    showToast(`Copied ${count} email address${count === 1 ? "" : "es"}`, true);
  }, [showToast]);

  const handleCopyError = useCallback((message) => {
    showToast(message, false);
  }, [showToast]);

  if (loadStatus === "loading") {
    return <div className="officer-dashboard officer-dashboard__placeholder">Loading applications…</div>;
  }

  if (loadStatus === "error") {
    return <div className="officer-dashboard officer-dashboard__error">{loadError}</div>;
  }

  if (!officerCommitteeName) {
    return (
      <div className="officer-dashboard officer-dashboard__error">
        Your account is not assigned to a committee.
      </div>
    );
  }

  if (!myCommittee) {
    return (
      <div className="officer-dashboard officer-dashboard__error">
        Could not find a committee matching &quot;{officerCommitteeName}&quot;.
      </div>
    );
  }

  return (
    <div className="officer-dashboard">
      <div className="officer-dashboard__header">
        <h2>{myCommittee.displayName}</h2>
        <span className="officer-dashboard__cycle">Cycle {recruitmentCycle}</span>
      </div>

      <OfficerStatsBar counts={statusCounts} activeStatus={statusFilter} onSelectStatus={setStatusFilter} />

      <OfficerFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        choiceFilter={choiceFilter}
        onChoiceFilterChange={setChoiceFilter}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
      />

      <div className="officer-dashboard__toolbar">
        <div className="officer-dashboard__count">
          {filteredApplications.length} of {enrichedApplications.length} applications
        </div>
        <CopyEmailsButton
          applications={filteredApplications}
          onCopied={handleCopied}
          onError={handleCopyError}
        />
      </div>

      <ApplicationTable
        applications={filteredApplications}
        onApplicationChanged={handleApplicationChanged}
        onRowClick={setSelectedApplicationId}
      />

      <ApplicationDetailDrawer
        application={selectedApplication}
        onClose={() => setSelectedApplicationId(null)}
        onApplicationChanged={handleApplicationChanged}
      />

      <Toast key={toast.key} showing={toast.visible} message={toast.message} success={toast.success} />
    </div>
  );
}
