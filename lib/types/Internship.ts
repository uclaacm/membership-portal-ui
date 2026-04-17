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
