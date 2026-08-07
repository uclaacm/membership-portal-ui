"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";

import fetchAllApplications from "@/app/actions/internship/fetchAllApplications";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import ApplicationTable from "@/app/internship/components/ApplicationTable";
import OfficerFilterBar from "@/app/internship/components/OfficerFilterBar";
import OfficerStatsBar from "@/app/internship/components/OfficerStatsBar";
import useDebouncedValue from "@/lib/hooks/useDebouncedValue";
import { authUserProfileAtom } from "@/lib/atoms";
import "./OfficerDashboard.scss";

const CHOICE_FIELDS = [
  { rank: 1, committeeField: "firstChoiceCommittee", statusField: "firstChoiceStatus" },
  { rank: 2, committeeField: "secondChoiceCommittee", statusField: "secondChoiceStatus" },
  { rank: 3, committeeField: "thirdChoiceCommittee", statusField: "thirdChoiceStatus" },
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
// about the single slot (if any) that matches their own committee.
function enrichForCommittee(application, committeeId) {
  const match = CHOICE_FIELDS.find((choice) => application[choice.committeeField] === committeeId);
  if (!match) return null;
  return {
    ...application,
    myChoiceRank: match.rank,
    myStatusField: match.statusField,
    myStatus: application[match.statusField],
  };
}

export default function OfficerDashboard() {
  const authProfile = useAtomValue(authUserProfileAtom);
  const officerCommitteeName = normalizeCommitteeName(
    authProfile && "committees" in authProfile ? authProfile.committees?.[0] : undefined,
  );

  const [committees, setCommittees] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [choiceFilter, setChoiceFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

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
  }, []);

  const myCommittee = useMemo(() => committees.find((committee) => (
    normalizeCommitteeName(committee.displayName) === officerCommitteeName
    || normalizeCommitteeName(committee.name) === officerCommitteeName
  )), [committees, officerCommitteeName]);

  const recruitmentCycle = applications[0]?.applicationCycle ?? getCurrentApplicationCycle();

  // Recomputed only when the raw application list or the officer's committee
  // changes — filtering below runs against this instead of re-deriving
  // rank/status on every keystroke or filter change.
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

  // Replace only the one application that changed so unrelated table rows
  // keep the same object reference and skip re-rendering.
  const handleStatusChanged = useCallback((applicationId, updatedApplication) => {
    setApplications((prev) => prev.map((application) => (
      application._id === applicationId ? { ...application, ...updatedApplication } : application
    )));
  }, []);

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

      <div className="officer-dashboard__count">
        {filteredApplications.length} of {enrichedApplications.length} applications
      </div>

      <ApplicationTable applications={filteredApplications} onStatusChanged={handleStatusChanged} />
    </div>
  );
}
