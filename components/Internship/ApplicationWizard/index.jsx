"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import fetchOwnApplication from "@/app/actions/internship/fetchOwnApplication";
import WizardProgressBar from "@/components/Internship/WizardProgressBar";
import { myInternshipApplicationAtom } from "@/lib/atoms";

const TOTAL_STEPS = 4;

export default function ApplicationWizard() {
  const [draft, setDraft] = useAtom(myInternshipApplicationAtom);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasFetched, setHasFetched] = useState(false);
  const [hydrationError, setHydrationError] = useState(null);
  const isHydrating = !draft && !hasFetched && hydrationError === null;

  useEffect(() => {
    if (draft || hasFetched) return undefined;
    let cancelled = false;
    (async () => {
      const result = await fetchOwnApplication();
      if (cancelled) return;
      if (result.success) {
        if (result.data) setDraft(result.data);
      } else {
        setHydrationError(result.error);
      }
      setHasFetched(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [draft, hasFetched, setDraft]);

  if (isHydrating) {
    return <div className="p-8 text-center text-gray-600">Loading your application...</div>;
  }
  if (hydrationError) {
    return <div className="p-8 text-center text-red-600">{hydrationError}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {draft && (
        <div className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Existing draft loaded for {draft.applicationCycle}
          {draft.lastModifiedAt ? ` — last saved ${new Date(draft.lastModifiedAt).toLocaleString()}` : ""}
        </div>
      )}
      <WizardProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="mt-6">Step {currentStep} content</div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
          onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => setCurrentStep(s => Math.min(TOTAL_STEPS, s + 1))}
          disabled={currentStep === TOTAL_STEPS}
        >
          Next
        </button>
      </div>
    </div>
  );
}
