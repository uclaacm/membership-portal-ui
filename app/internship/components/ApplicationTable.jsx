"use client";

import { memo } from "react";

import StatusUpdateDropdown from "./StatusUpdateDropdown";

const CHOICE_RANK_LABELS = { 1: "1st Choice", 2: "2nd Choice", 3: "3rd Choice" };

function ApplicationRow({ application, onStatusChanged, onRowClick }) {
  return (
    <tr className="officer-application-table__row" onClick={() => onRowClick(application._id)}>
      <td>{application.firstName} {application.lastName}</td>
      <td>{application.email}</td>
      <td>{application.graduationYear ?? "—"}</td>
      <td>{application.major}</td>
      <td>{CHOICE_RANK_LABELS[application.myChoiceRank] ?? "—"}</td>
      <td onClick={(event) => event.stopPropagation()}>
        <StatusUpdateDropdown
          applicationId={application._id}
          statusField={application.myStatusField}
          status={application.myStatus}
          onChanged={onStatusChanged}
        />
      </td>
    </tr>
  );
}

const MemoApplicationRow = memo(ApplicationRow);

export default function ApplicationTable({ applications, onStatusChanged, onRowClick }) {
  if (applications.length === 0) {
    return (
      <div className="officer-application-table__empty">
        No applications match the current filters.
      </div>
    );
  }

  return (
    <table className="officer-application-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Year</th>
          <th>Major</th>
          <th>Choice Rank</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((application) => (
          <MemoApplicationRow
            key={application._id}
            application={application}
            onStatusChanged={onStatusChanged}
            onRowClick={onRowClick}
          />
        ))}
      </tbody>
    </table>
  );
}
