"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";

import ApplicationWizard from "@/components/Internship/ApplicationWizard";
import OfficerIneligibilityMessage from "@/components/Internship/OfficerIneligibilityMessage";
import { isAdminAtom, isOfficerAtom } from "@/lib/atoms";

export default function ApplyPage() {
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration gate: flips after client mount so role atoms hydrate from AuthSync before the role check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (isAdmin || isOfficer) return <OfficerIneligibilityMessage />;
  return <ApplicationWizard />;
}