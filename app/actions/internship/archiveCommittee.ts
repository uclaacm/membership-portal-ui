"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin } from "@/lib/token";
import type { ArchiveCommitteeResult } from "@/lib/types/Internship";

export default async function archiveCommittee(committeeId: string): Promise<ArchiveCommitteeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(
      `${Config.API_URL}${Config.routes.internship.committees}/${committeeId}/archive`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ??
        (typeof data?.error === "string" ? data.error : undefined) ??
        data?.message ??
        `Request failed (${response.status})`;
      Logger.error(`archiveCommittee failed: ${msg}`);
      return { success: false, error: msg };
    }

    return { success: true, archivedCount: typeof data?.archivedCount === "number" ? data.archivedCount : 0 };
  } catch (err) {
    Logger.error(`archiveCommittee failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to archive committee." };
  }
}
