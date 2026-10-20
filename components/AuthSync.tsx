"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from "@/lib/atoms";
import { isTokenAdmin, isTokenOfficer, tokenExpiresAt } from "@/lib/token";
import CookieStore from "@/lib/cookieStore";
import type { UserExtendedProfile } from "@/lib/types/User";

export default function AuthSync({
  user,
  unauthorized = false,
}: {
  user: UserExtendedProfile | null;
  unauthorized?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const setUserProfile = useSetAtom(authUserProfileAtom);
  const setIsAdmin = useSetAtom(isAdminAtom);
  const setIsOfficer = useSetAtom(isOfficerAtom);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let invalidated = false;
    let hadToken = !!CookieStore.get("token");

    const invalidate = () => {
      if (invalidated) return;
      invalidated = true;
      CookieStore.remove("token");
      setUserProfile(null);
      setIsAdmin(false);
      setIsOfficer(false);
      if (pathname !== "/login") router.replace("/login");
      router.refresh();
    };

    const checkExpiry = () => {
      clearTimeout(timer);
      if (invalidated) return;
      // Always read latest cookie val
      const token = CookieStore.get("token");
      if (!token) {
        if (hadToken) invalidate();
        return;
      }
      hadToken = true;
      const remaining = (tokenExpiresAt(token) ?? 0) - Date.now();
      if (remaining <= 0) {
        invalidate();
        return;
      }
      timer = setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
    };

    // Only 401 sets unauthorized
    if (unauthorized) {
      invalidate();
      return;
    }

    checkExpiry();

    if (!invalidated) {
      const token = CookieStore.get("token");
      setUserProfile(token ? user : null);
      setIsAdmin(!!user && !!token && isTokenAdmin(token));
      setIsOfficer(!!user && !!token && isTokenOfficer(token));
    }

    // Timers can be suspended when device sleeps or tab is backgrounded
    window.addEventListener("focus", checkExpiry);
    document.addEventListener("visibilitychange", checkExpiry);
    window.addEventListener("pageshow", checkExpiry);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", checkExpiry);
      document.removeEventListener("visibilitychange", checkExpiry);
      window.removeEventListener("pageshow", checkExpiry);
    };
  }, [user, unauthorized, pathname, router, setUserProfile, setIsAdmin, setIsOfficer]);

  return null;
}
