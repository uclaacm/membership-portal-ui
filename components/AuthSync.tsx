"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { accessTypeAtom, authUserProfileAtom } from "@/lib/atoms";
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
  const setAccessType = useSetAtom(accessTypeAtom);

  // A token the API rejected is dead — clear it and send the user to log in, rather than
  // leaving them on a signed-in-looking page whose every request fails. This is what makes a
  // deploy that rotated the signing secret self-correct instead of needing a manual sign-out.
  //
  // Only 401 triggers this. A 403 means the session is valid but the role lacks permission
  // (an officer opening an admin-only endpoint, say), and logging out on 403 would boot
  // officers out of the portal the moment they touched one.
  useEffect(() => {
    if (!unauthorized) return;
    CookieStore.remove("token");
    // Guard against a redirect loop: once the cookie is gone the next render is a clean
    // logged-out state, and /login itself needs no redirect.
    if (pathname !== "/login") router.replace("/login");
  }, [unauthorized, pathname, router]);

  // The access type must come from the freshly fetched user record, never the token: a token
  // is frozen at login and would go stale the moment a role changes.
  useEffect(() => {
    setUserProfile(user);
    setAccessType(user?.accessType ?? null);
  }, [user, setUserProfile, setAccessType]);

  return null;
}
