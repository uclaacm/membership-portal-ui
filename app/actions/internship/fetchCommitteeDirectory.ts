"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { CommitteeDirectoryEntry, FetchCommitteeDirectoryResult } from "@/lib/types/Internship";

export default async function fetchCommitteeDirectory(): Promise<FetchCommitteeDirectoryResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(`${Config.API_URL}${Config.routes.internship.committeesDirectory}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok || !data || data.error) {
      return { success: false, error: data?.error?.message ?? "Failed to fetch committees." };
    }

    const raw: unknown[] = Array.isArray(data.committees) ? data.committees : [];
    const committees: CommitteeDirectoryEntry[] = raw.map((c) => {
      const rec = c as CommitteeDirectoryEntry & { _id?: string };
      return { ...rec, id: rec.id ?? rec._id ?? "" };
    });

    return { success: true, data: committees };
  } catch (err) {
    Logger.error(`fetchCommitteeDirectory failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch committees." };
  }
}
