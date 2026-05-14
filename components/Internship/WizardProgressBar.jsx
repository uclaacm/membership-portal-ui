"use client";

import "./style.scss";

export default function WizardProgressBar({ currentStep, totalSteps }) {
  const segments = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="wizard-progress-bar" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {segments.map(step => (
        <div key={step} className={`wizard-progress-segment${step <= currentStep ? " active" : ""}`} />
      ))}
    </div>
  );
}
