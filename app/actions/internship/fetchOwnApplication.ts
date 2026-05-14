"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { FetchOwnApplicationResult, MyInternshipApplication } from "@/lib/types/Internship";

export default async function fetchOwnApplication(): Promise<FetchOwnApplicationResult> {
  const cks = await cookies();
  const token = cks.get("token")?.value;

  // Logged-out is expected, not an error — return silently rather than logging.
  if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

  try {
    const response = await fetch(Config.API_URL + Config.routes.internship.ownApplication, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) return { success: true, data: null };

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.success === false) {
      return {
        success: false,
        error: data.errors?.[0]?.msg ?? data.message ?? data.error ?? "Failed to fetch application.",
      };
    }

    return { success: true, data: data.data as MyInternshipApplication };
  } catch (err) {
    Logger.error(`fetchOwnApplication failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch application." };
  }
}