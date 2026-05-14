"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";

import WizardProgressBar from "@/components/Internship/WizardProgressBar";
import { myApplicationAtom } from "@/lib/atoms";

import "../style.scss";

const TOTAL_STEPS = 4;

export default function ApplicationWizard() {
  const draft = useAtomValue(myApplicationAtom);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="application-wizard">
      {draft && (
        <div className="draft-banner">
          Existing draft loaded for {draft.applicationCycle}
          {draft.lastModifiedAt ? ` — last saved ${new Date(draft.lastModifiedAt).toLocaleString()}` : ""}
        </div>
      )}
      <WizardProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="wizard-step-body">Step {currentStep} content</div>
      <div className="wizard-nav">
        <button
          type="button"
          className="wizard-nav-button"
          onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          Back
        </button>
        <button
          type="button"
          className="wizard-nav-button wizard-nav-button-primary"
          onClick={() => setCurrentStep(s => Math.min(TOTAL_STEPS, s + 1))}
          disabled={currentStep === TOTAL_STEPS}
        >
          Next
        </button>
      </div>
    </div>
  );
}
