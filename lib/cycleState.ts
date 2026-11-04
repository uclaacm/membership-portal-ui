import moment from "moment";

/**
 * One derivation of recruitment state, shared by every surface that reports it.
 *
 * The topbar launcher, the Control Panel's Settings block and its Committees table each used to
 * decide "is recruitment open" for themselves. They disagreed: the launcher had no data at all
 * and read as closed while the internship screens showed every committee accepting
 * applications. Anything that displays cycle state must read it from here.
 */

export interface InternshipCommittee {
  id?: string;
  _id?: string;
  name?: string;
  displayName?: string;
  isActive?: boolean;
  applicationDeadline?: string | null;
}

export interface CycleState {
  /** True when at least one committee is accepting applications. */
  open: boolean;
  openCount: number;
  /** Earliest upcoming deadline, formatted for display, or null. */
  closes: string | null;
  /** Staff-only figure for the launcher's meta line. */
  awaitingReview?: number;
}

export function deriveCycleState(
  committees: InternshipCommittee[],
  awaitingReview?: number,
): CycleState {
  const open = (committees ?? []).filter((c) => c.isActive);

  const nextDeadline = open
    .map((c) => c.applicationDeadline)
    .filter(Boolean)
    .sort()[0];

  return {
    open: open.length > 0,
    openCount: open.length,
    closes: nextDeadline ? moment(nextDeadline).format("MMM D") : null,
    awaitingReview,
  };
}
