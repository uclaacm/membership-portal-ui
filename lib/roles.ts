import Config from "@/lib/config";
import Logger from "@/lib/logger";
import type { AccessType } from "@/lib/types/User";

// Super admins hold every admin capability, so "admin" is a capability check, not an equality.
export function hasAdminAccess(accessType: AccessType | null | undefined): boolean {
  return accessType === "ADMIN" || accessType === "SUPERADMIN";
}

export function hasOfficerAccess(accessType: AccessType | null | undefined): boolean {
  return accessType === "OFFICER";
}

/**
 * Server-side lookup of the current user's access type from the API. Returns null when the
 * token is rejected or the request fails, which callers should treat as "no elevated role".
 */
export async function fetchAccessType(token: string): Promise<AccessType | null> {
  try {
    const response = await fetch(Config.API_URL + Config.routes.user.user, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;

    const data = await response.json();
    return data?.user?.accessType ?? null;
  } catch (err) {
    Logger.error(`fetchAccessType failed: ${(err as Error).message}`);
    return null;
  }
}
