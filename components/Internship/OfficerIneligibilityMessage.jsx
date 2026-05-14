"use client";

export default function OfficerIneligibilityMessage() {
  return (
    <div className="mx-auto mt-16 max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600">
          <i className="fa fa-lock" aria-hidden="true" />
        </span>
      </div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Application not available</h1>
      <p className="text-gray-600">
        Officers and admins are not eligible to apply for the internship program. If you believe this is a mistake or
        you need access for another reason, please reach out to ACM leadership.
      </p>
    </div>
  );
}
