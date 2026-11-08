"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface ReminderEmailSettings {
  host: string | null;
  port: number | null;
  username: string | null;
  from: string | null;
  configured: boolean;
}

const EMPTY: ReminderEmailSettings = {
  host: null, port: null, username: null, from: null, configured: false,
};

export async function fetchReminderEmailSettings(): Promise<ReminderEmailSettings> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.settings.emailReminder}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${cks.get("token")?.value}` },
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || !data || data.error) {
      throw new Error(data?.error?.message ?? "Failed to load reminder email settings");
    }
    return data.settings ?? EMPTY;
  } catch (err) {
    Logger.error(`fetchReminderEmailSettings failed: ${(err as Error).message}`);
    return EMPTY;
  }
}

export async function sendTestEmail(): Promise<{ sent: boolean; message: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.settings.emailTest}`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${cks.get("token")?.value}` },
    });
    const data = await response.json();
    if (!response.ok || !data || data.error) {
      return { sent: false, message: data?.error?.message ?? "Test email failed" };
    }
    return { sent: !!data.sent, message: data.message ?? "" };
  } catch (err) {
    Logger.error(`sendTestEmail failed: ${(err as Error).message}`);
    return { sent: false, message: "Could not send the test email." };
  }
}
