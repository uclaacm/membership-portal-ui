"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type UploadResumeResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string; notFound?: boolean; submittedBlock?: boolean };

// formData carries the PDF in a "resume" field. The file travels through this action's request
// body, which next.config.ts caps at 6 MB, just above the API's 5 MB resume limit.
export default async function uploadResume(id: string, formData: FormData): Promise<UploadResumeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(
      Config.API_URL + Config.routes.internship.applications + "/" + encodeURIComponent(id) + "/resume",
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (response.status === 404) {
      return { success: false, error: "Application not found", notFound: true };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const msg = data?.message ?? `Failed to upload resume (${response.status}).`;
      const isSubmittedBlock = response.status === 403 && typeof msg === "string" && msg.toLowerCase().includes("submitted");
      return isSubmittedBlock ? { success: false, error: msg, submittedBlock: true } : { success: false, error: msg };
    }

    if (!data.data) {
      Logger.error("uploadResume failed: missing application in response");
      return { success: false, error: "Failed to upload resume." };
    }

    return { success: true, data: data.data as InternshipApplication };
  } catch (err) {
    Logger.error(`uploadResume failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to upload resume." };
  }
}
