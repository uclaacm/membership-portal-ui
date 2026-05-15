"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { formatEventApiFailure, hasApiError } from "./parseEventApiResponse";

export default async function fetchRepeatedEventGroup(
  eventGroupId: string,
): Promise<{ success: boolean; events?: any[]; error?: string }> {
  try {
    if (!eventGroupId?.trim()) return { success: false, error: "Missing event group id" };

    const cks = await cookies();
    const token = cks.get("token")?.value;

    const response = await fetch(`${Config.API_URL + Config.routes.events.repeated}/${encodeURIComponent(eventGroupId)}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        return { success: false, error: `Request failed (${response.status})` };
      }
    }

    if (!response.ok) {
      return { success: false, error: formatEventApiFailure(data, response.status) };
    }

    if (hasApiError(data)) {
      return { success: false, error: formatEventApiFailure(data, response.status) };
    }

    return { success: true, events: data?.events ?? [] };
  } catch (err) {
    Logger.error(`fetchRepeatedEventGroup failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch repeated event group." };
  }
}
