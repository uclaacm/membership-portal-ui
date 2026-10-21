import { formatSpreadsheetDate } from "./spreadsheet";

const CHOICES = ["firstChoice", "secondChoice", "thirdChoice"];

// Use the submitted question text, not today's committee configuration. Include
// committee and text in the key so reused question keys cannot merge answers.
function questionId(committeeId, response) {
  return JSON.stringify([committeeId, response.questionKey, response.question]);
}

export function buildApplicationSpreadsheetRows(applications, committeeLookup) {
  const committeeName = id => id ? committeeLookup.get(id) ?? id : "";
  const questions = new Map();
  applications.forEach(application => {
    CHOICES.forEach(choice => {
      const committeeId = application[`${choice}Committee`];
      (application[`${choice}Responses`] || []).forEach(response => {
        questions.set(questionId(committeeId, response), `${committeeName(committeeId)}: ${response.question}`);
      });
    });
  });

  const header = [
    "First Name", "Last Name", "Email", "Phone", "University", "Major", "Grad Year",
    ...["1st", "2nd", "3rd"].flatMap(rank => [
      `${rank} Choice`, `${rank} Choice Status`, `${rank} Choice Officer 1 Rating`,
      `${rank} Choice Officer 2 Rating`, `${rank} Choice Notes`,
    ]),
    "Resume", "Cover Letter", "Cycle", "Submission Status", "Submitted",
    ...questions.values(),
  ];
  const rows = applications.map(application => {
    const answers = new Map();
    CHOICES.forEach(choice => {
      (application[`${choice}Responses`] || []).forEach(response => {
        answers.set(questionId(application[`${choice}Committee`], response), response.answer);
      });
    });
    return [
      application.firstName, application.lastName, application.email, application.phone,
      application.university, application.major, application.graduationYear,
      ...CHOICES.flatMap(choice => [
        committeeName(application[`${choice}Committee`]), application[`${choice}Status`],
        application[`${choice}Officer1Rating`], application[`${choice}Officer2Rating`],
        application[`${choice}Notes`],
      ]),
      application.resumeUrl, application.coverLetter, application.applicationCycle,
      application.submissionStatus, formatSpreadsheetDate(application.submittedAt),
      ...[...questions.keys()].map(key => answers.get(key) ?? ""),
    ];
  });
  return [header, ...rows];
}
