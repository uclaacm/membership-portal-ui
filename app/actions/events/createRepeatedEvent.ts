"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { formatEventApiFailure, hasApiError } from "./parseEventApiResponse";

export type RecurrenceInput = {
  frequency: "daily" | "weekly" | "monthly";
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
