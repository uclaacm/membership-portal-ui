"use client";

import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import fetchCommitteeDirectory from "@/app/actions/internship/fetchCommitteeDirectory";
import { committeeDirectoryAtom } from "@/lib/atoms";
import { committeeStyle } from "@/lib/committees";

const NO_COMMITTEES = [];

// One request per page load, however many components ask. Cleared on failure so the next
// mount retries instead of caching an empty list.
let inFlight = null;

/**
 * Every committee (active or not) from the database, the single committee list for the UI.
 *
 * `styleFor(name)` resolves an event's committee to its label, color and banner, falling back to
 * the ACM defaults while loading or for a name with no record. `refresh()` refetches after a
 * committee is created, edited or deleted.
 */
export default function useCommitteeDirectory() {
  const [directory, setDirectory] = useAtom(committeeDirectoryAtom);

  const load = useCallback(() => {
    if (!inFlight) {
      inFlight = fetchCommitteeDirectory().then((result) => {
        if (!result.success) {
          inFlight = null;
          return null;
        }
        return result.data;
      });
    }
    return inFlight;
  }, []);

  useEffect(() => {
    if (directory) return undefined;
    let cancelled = false;
    load().then((data) => {
      if (!cancelled && data) setDirectory(data);
    });
    return () => { cancelled = true; };
  }, [directory, load, setDirectory]);

  const refresh = useCallback(async () => {
    inFlight = null;
    const data = await load();
    if (data) setDirectory(data);
  }, [load, setDirectory]);

  const committees = directory ?? NO_COMMITTEES;
  const styleFor = useCallback((name) => committeeStyle(committees, name), [committees]);

  return {
    committees, loaded: directory !== null, styleFor, refresh,
  };
}
