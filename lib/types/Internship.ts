export interface InternshipQuestionResponse {
  questionKey: string;
  question: string;
  answer: string;
}

export interface InternshipApplication {
  uuid: string;
  applicant: string;
  status: string;
  responses: InternshipQuestionResponse[];
  createdAt: string;
  updatedAt: string;
}

export type FetchApplicationByIdResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string };

export interface InternshipChoiceResponse {
  questionKey: string;
  question: string;
  answer: string;
}

export type InternshipChoiceStatus =
  | "pending"
  | "reviewing"
  | "interview_scheduled"
  | "accepted"
  | "rejected";

export interface MyInternshipApplication {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university: string;
  major?: string;
  graduationYear?: number;
  resumeUrl?: string;
  coverLetter?: string;
  // Committee IDs are Mongo ObjectIds serialized as 24-char hex strings.
  firstChoiceCommittee?: string;
  secondChoiceCommittee?: string;
  thirdChoiceCommittee?: string;
  firstChoiceResponses: InternshipChoiceResponse[];
  secondChoiceResponses: InternshipChoiceResponse[];
  thirdChoiceResponses: InternshipChoiceResponse[];
  // Officer-side review status (default 'pending'). Read-only for the wizard.
  firstChoiceStatus: InternshipChoiceStatus;
  secondChoiceStatus: InternshipChoiceStatus;
  thirdChoiceStatus: InternshipChoiceStatus;
  applicationCycle: string; // "YYYY-(YYYY+1)" e.g. "2026-2027"
  submissionStatus: "draft" | "submitted";
  // Soft-delete fields. Drafts the wizard sees should always have deletedAt: null.
  deletedAt: string | null;
  deletedBy: string | null;
  submittedAt: string;
  lastModifiedAt: string;
  // createdAt/updatedAt come from Mongoose `timestamps: true`.
  createdAt: string;
  updatedAt: string;
}

export type FetchOwnApplicationResult =
  | { success: true; data: MyInternshipApplication | null }
  | { success: false; error: string };

export interface InternshipCommitteeQuestion {
  questionKey: string;
  questionText: string;
  questionType: "short_text" | "long_text" | "multiple_choice";
  required: boolean;
  order: number;
  choices: string[];
}

export interface InternshipCommittee {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  subcommittees: string[];
  isActive: boolean;
  internLimit?: number;
  applicationDeadline?: string;
  customQuestions: InternshipCommitteeQuestion[];
}

export type FetchCommitteeByIdResult = { success: true; data: InternshipCommittee } | { success: false; error: string };

export interface InternshipCustomQuestion {
  questionKey: string;
  questionText: string;
  questionType: "short_text" | "long_text" | "multiple_choice";
  required?: boolean;
  order?: number;
  choices?: string[];
}

export type CreateInternshipCommitteePayload = {
  name: string;
  displayName: string;
  description?: string;
  subcommittees?: string[];
  isActive?: boolean;
  internLimit?: number;
  applicationDeadline?: string | Date;
  customQuestions?: InternshipCustomQuestion[];
};

export type CreateInternshipCommitteeResult =
  | { success: true; data: InternshipCommittee }
  | { success: false; error: string };
