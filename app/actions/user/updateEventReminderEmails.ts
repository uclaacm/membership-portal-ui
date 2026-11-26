"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function updateEventReminderEmails(enabled: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const response = await fetch(Config.API_URL + Config.routes.user.eventReminderEmails, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled }),
    });
    const data = await response.json();
    if (!response.ok || data?.error) {
      return { success: false, error: data?.error?.message ?? "Could not update email preference." };
    }
    return { success: true };
  } catch (err) {
    Logger.error(`updateEventReminderEmails failed: ${(err as Error).message}`);
    return { success: false, error: "Could not update email preference." };
  }
}
