import type { CommitteeDirectoryEntry } from "@/lib/types/Internship";

/**
 * Committees live in the database and nowhere else: names, labels, colors and banners all come
 * from the API (see useCommitteeDirectory). Nothing in the UI keeps its own committee list.
 */

/**
 * The `event.committee` value for chapter-wide events. Not a real committee, so it has no
 * record; it is the one committee-like value the UI knows about.
 */
export const GENERAL_COMMITTEE = "ACM";

/** ACM blue, used for chapter-wide events and any committee without a color set. */
export const DEFAULT_COMMITTEE_COLOR = "#1d6bff";

export interface CommitteeStyle {
  /** What to show: the committee's displayName, or the raw name if it has no record. */
  label: string;
  color: string;
  /** The committee's banner, or null so each caller can choose its own fallback. */
  bannerUrl: string | null;
}

export function committeeStyle(
  committees: CommitteeDirectoryEntry[],
  name?: string | null,
): CommitteeStyle {
  const key = name || GENERAL_COMMITTEE;
  const record = committees.find((c) => c.name === key);
  return {
    label: record?.displayName || key,
    color: record?.color || DEFAULT_COMMITTEE_COLOR,
    bannerUrl: record?.bannerUrl || null,
  };
}
