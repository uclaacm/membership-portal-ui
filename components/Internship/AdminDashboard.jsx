"use client";

import { useCallback, useEffect, useState } from "react";
import CommitteeTable from "@/components/Internship/CommitteeTable";
import ApplicationTable from "@/components/Internship/ApplicationTable";
import fetchCommittees from "@/app/actions/internship/fetchCommittees";
import fetchAllApplications from "@/app/actions/internship/fetchAllApplications";
import "./AdminDashboard.scss";

const TABS = [
  { id: "committees", label: "Committees" },
  { id: "applications", label: "Applications" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("committees");
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState(null);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);

  const loadCommittees = useCallback(async () => {
    setLoading(true);
    const result = await fetchCommittees();
    if (result.success) {
      setCommittees(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    const result = await fetchAllApplications();
    if (result.success) {
      setApplications(result.data);
      setApplicationsError(null);
    } else {
      setApplicationsError(result.error);
    }
    setApplicationsLoading(false);
    setApplicationsLoaded(true);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadCommittees);
  }, [loadCommittees]);

  useEffect(() => {
    if (activeTab === "applications" && !applicationsLoaded && !applicationsLoading) {
      Promise.resolve().then(loadApplications);
    }
  }, [activeTab, applicationsLoaded, applicationsLoading, loadApplications]);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="admin-dashboard__tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`admin-dashboard__tab${
              activeTab === tab.id ? " admin-dashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-dashboard__panel" role="tabpanel">
        {activeTab === "committees" && (
          <>
            {loading && <div className="admin-dashboard__placeholder">Loading committees…</div>}
            {!loading && error && (
              <div className="committee-table-wrapper__error">{error}</div>
            )}
            {!loading && !error && (
              <CommitteeTable committees={committees} onMutated={loadCommittees} />
            )}
          </>
        )}
        {activeTab === "applications" && (
          <>
            {applicationsLoading && (
              <div className="admin-dashboard__placeholder">Loading applications…</div>
            )}
            {!applicationsLoading && applicationsError && (
              <div className="committee-table-wrapper__error">{applicationsError}</div>
            )}
            {!applicationsLoading && !applicationsError && (
              <ApplicationTable applications={applications} committees={committees} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
