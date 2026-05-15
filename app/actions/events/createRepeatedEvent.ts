"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { formatEventApiFailure, hasApiError } from "./parseEventApiResponse";

export type RecurrenceInput = {
  /** Repeat every X weeks */
  intervalWeeks: number;
  /** ISO weekdays 1..7 (1=Mon, 7=Sun). Omit to use only the template start date weekday. */
  daysOfWeek?: number[];
  /** ISO-8601; server uses calendar date only. */
  seriesEndDate: string;
};

export default async function createRepeatedEvent(
  event: Record<string, unknown>,
  recurrence: RecurrenceInput,
): Promise<{ success: boolean; eventGroupId?: string; error?: string }> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const response = await fetch(Config.API_URL + Config.routes.events.repeated, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event, recurrence }),
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

    return { success: true, eventGroupId: data?.eventGroupId };
  } catch (err) {
    Logger.error(`createRepeatedEvent failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to create repeated events." };
  }
}
