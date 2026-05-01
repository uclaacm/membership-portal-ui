"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { formatEventApiFailure, hasApiError } from "./parseEventApiResponse";

export type UpdateRepeatedScope = "all" | "fromInstance";

export default async function updateRepeatedEventGroup(
  eventGroupId: string,
  body: {
    scope: UpdateRepeatedScope;
    fromUuid?: string;
    event: Record<string, unknown>;
  },
): Promise<{ success: boolean; events?: any[]; error?: string }> {
  try {
    if (!eventGroupId?.trim()) return { success: false, error: "Missing event group id" };

    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const payload: Record<string, unknown> = {
      scope: body.scope,
      event: body.event,
    };
    if (body.scope === "fromInstance" && body.fromUuid) {
      payload.fromUuid = body.fromUuid;
    }

    const response = await fetch(`${Config.API_URL + Config.routes.events.repeated}/${encodeURIComponent(eventGroupId)}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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

    return { success: true, events: data?.events };
  } catch (err) {
    Logger.error(`updateRepeatedEventGroup failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update repeated events." };
  }
}
