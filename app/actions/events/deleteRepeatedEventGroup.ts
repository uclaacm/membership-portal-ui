"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { formatEventApiFailure, hasApiError } from "./parseEventApiResponse";

export type DeleteRepeatedScope = "all" | "fromInstance";

export default async function deleteRepeatedEventGroup(
  eventGroupId: string,
  body: { scope: DeleteRepeatedScope; fromUuid?: string },
): Promise<{ success: boolean; numDeleted?: number; error?: string }> {
  try {
    if (!eventGroupId?.trim()) return { success: false, error: "Missing event group id" };

    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const payload: Record<string, unknown> = { scope: body.scope };
    if (body.scope === "fromInstance" && body.fromUuid) {
      payload.fromUuid = body.fromUuid;
    }

    const response = await fetch(`${Config.API_URL + Config.routes.events.repeated}/${encodeURIComponent(eventGroupId)}`, {
      method: "DELETE",
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

    return { success: true, numDeleted: data?.numDeleted };
  } catch (err) {
    Logger.error(`deleteRepeatedEventGroup failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to delete repeated events." };
  }
}
