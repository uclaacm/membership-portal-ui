'use client';

import PropTypes from 'prop-types';
import DataTable from '../components/DataTable';
import {
  PageHeader, SectionHead, Pill, Dagger, ApiLegend,
} from '../components/primitives';
import { formatDate } from '../format';

const A = 'allowed';
const D = 'denied';
const P = 'protected';

/**
 * The authoritative role model, mirrored from the design handoff.
 *
 * Columns are [member, officer in own committee, officer in another committee, admin,
 * super admin]. The server-side authorization in the API is written to match this table;
 * if the two ever disagree, this table is the spec and the API is the bug.
 */
const CAPABILITIES = [
  ['View members of own committee', D, A, D, A, A],
  ['View member emails portal-wide', D, D, D, A, A],
  ['View committee applications', D, A, D, A, A],
  ['Advance or reject applications', D, A, D, A, A],
  ['Open or close recruitment', D, D, D, A, A],
  ['Edit committee settings', D, D, D, A, A],
  ['Create events', D, A, D, A, A],
  ['Delete any event in own committee', D, A, D, A, A],
  ['Delete events in another committee', D, D, D, A, A],
  ['Upload media', D, A, D, A, A],
  ['Delete any media in own committee', D, A, D, A, A],
  ['Sync events from Sheets', D, D, D, A, A],
  ['Assign officer role', D, D, D, A, A],
  ['View audit log', D, D, D, A, A],
  ['Assign admin role', D, D, D, P, A],
  ['Remove an admin or president', D, D, D, P, A],
  ['Rotate one-click password', D, D, D, P, A],
];

const ROLE_COLUMNS = ['Member', 'Officer — own cmte', 'Officer — other cmte', 'Admin', 'Super admin'];

function Mark({ value }) {
  if (value === 'denied') return <span className="cp-mark-inner">—</span>;
  return <span className="cp-mark-inner">✓</span>;
}

Mark.propTypes = { value: PropTypes.string.isRequired };

export default function Committees({
  committees, directory, admins, officers, events,
}) {
  // One row per committee in the database: the directory has every committee, active or not.
  // `committees` adds the full internship record (deadline, intern limit) where this viewer
  // can see it. Officers, admins and events all reference a committee by its permanent `name`.
  const rows = directory.map((entry) => {
    const { name } = entry;
    const record = committees.find((c) => c.name === name) ?? entry;
    const president = admins.find((a) => (a.committees || []).includes(name) && a.level === 'President');
    return {
      name,
      label: entry.displayName || name,
      record,
      president,
      officerCount: officers.filter((o) => (o.committees || []).includes(name)).length,
      eventCount: events.filter((e) => e.committee === name).length,
    };
  });

  const columns = [
    { key: 'committee', label: 'Committee', cellClassName: 'identifier', render: (row) => row.label },
    {
      key: 'president',
      label: <>President <Dagger /></>,
      render: (row) => (row.president
        ? `${row.president.firstName} ${row.president.lastName}`
        : '—'),
    },
    {
      key: 'officers', label: <>Officers <Dagger /></>, numeric: true, render: (row) => row.officerCount,
    },
    {
      key: 'recruitment',
      label: 'Recruitment',
      render: (row) => (row.record.isActive
        ? <Pill tone="success">Open</Pill>
        : <Pill tone="muted">Closed</Pill>),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (row) => (row.record?.applicationDeadline
        ? formatDate(row.record.applicationDeadline)
        : '—'),
    },
    {
      key: 'limit', label: 'Intern limit', numeric: true, render: (row) => row.record?.internLimit ?? '—',
    },
    {
      key: 'applications', label: 'Applications', numeric: true, render: (row) => row.record?.applicationCount ?? 0,
    },
    {
      key: 'events', label: 'Events', numeric: true, render: (row) => row.eventCount,
    },
  ];

  const matrixColumns = [
    {
      key: 'capability',
      label: 'Capability',
      cellClassName: 'cp-capability',
      render: (row) => row[0],
    },
    ...ROLE_COLUMNS.map((label, index) => ({
      key: label,
      label,
      headerClassName: 'cp-role-col',
      cellClassName: 'cp-mark',
      render: (row) => <Mark value={row[index + 1]} />,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Committees"
        subtitle="Each committee, its officers, and what committee scope actually grants."
      />

      <div className="cp-stack">
        <div>
          {/* Read-only by design. Creating, editing and opening or closing committees all live
              in the Internship admin screens, which own the cycle; duplicating them here gave
              two places to change the same record and no indication of which had run last. */}
          <SectionHead title="Committees" count={rows.length} />
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.name}
            empty="No committees configured."
          />
        </div>

        <div>
          <SectionHead title="What committee scope grants" />
          <p className="cp-matrix-intro">
            Admins are committee presidents and Dev Team, and are fully trusted portal-wide —
            nothing about the admin role is committee-scoped. Officers are the scoped role: they
            work inside their own committee, and may remove anything other officers created
            there, but hold no configuration or role-granting rights. Amber cells are protected:
            available to admins on an as-needed basis and always written to the audit log.
          </p>

          <div className="cp-table-scroll">
            <table className="cp-table cp-matrix">
              <thead>
                <tr>
                  {matrixColumns.map((column) => (
                    <th key={column.key} className={column.headerClassName || ''}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAPABILITIES.map((row) => (
                  <tr key={row[0]}>
                    {matrixColumns.map((column, index) => (
                      <td
                        key={column.key}
                        className={`${column.cellClassName} ${index > 0 ? row[index] : ''}`.trim()}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cp-matrix-legend">
            <span>✓ allowed</span>
            <span>— denied</span>
            <span>✓ protected — as-needed, always audited</span>
          </div>
        </div>
      </div>

      <ApiLegend />
    </>
  );
}

Committees.propTypes = {
  committees: PropTypes.arrayOf(PropTypes.object).isRequired,
  directory: PropTypes.arrayOf(PropTypes.object).isRequired,
  admins: PropTypes.arrayOf(PropTypes.object).isRequired,
  officers: PropTypes.arrayOf(PropTypes.object).isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
};
