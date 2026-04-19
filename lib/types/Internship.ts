export interface InternshipQuestionResponse {
  questionKey: string;
  question: string;
  answer: string;
}

export interface InternshipApplication {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university: string;
  major: string;
  graduationYear: number;
  resumeUrl?: string;
  coverLetter?: string;
  firstChoiceCommittee: string;
  secondChoiceCommittee?: string;
  thirdChoiceCommittee?: string;
  firstChoiceResponses: InternshipQuestionResponse[];
  secondChoiceResponses: InternshipQuestionResponse[];
  thirdChoiceResponses: InternshipQuestionResponse[];
  firstChoiceStatus: string;
  secondChoiceStatus: string;
  thirdChoiceStatus: string;
  applicationCycle: string;
  submittedAt: string;
  lastModifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type InternshipApplicationsResult =
  | { success: true; data: InternshipApplication[] }
  | { success: false; error: string };
