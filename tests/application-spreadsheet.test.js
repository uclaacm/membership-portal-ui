import { buildApplicationSpreadsheetRows } from '../lib/applicationSpreadsheet';
import { buildCsv } from '../lib/spreadsheet';

test('exports full applications and keeps answers aligned across committees and choice ranks', () => {
  const response = (question, answer) => ({ questionKey: 'why', question, answer });
  const applications = [{
    firstName: 'Ada', coverLetter: 'My cover letter',
    firstChoiceCommittee: 'dev', firstChoiceStatus: 'accepted',
    firstChoiceOfficer1Rating: 'yes', firstChoiceOfficer2Rating: 'maybe', firstChoiceNotes: 'Review notes',
    firstChoiceResponses: [response('Why Dev?', 'Dev answer')],
    secondChoiceCommittee: 'ai', secondChoiceResponses: [response('Why AI?', 'AI answer')],
    thirdChoiceCommittee: 'design', thirdChoiceResponses: [response('Why Design?', 'Design answer')],
  }, {
    firstName: 'Grace', secondChoiceCommittee: 'dev',
    secondChoiceResponses: [response('Why Dev?', 'Second applicant'), response('Updated question?', 'Updated answer')],
  }];
  const [header, first, second] = buildApplicationSpreadsheetRows(applications,
    new Map([['dev', 'Dev'], ['ai', 'AI'], ['design', 'Design']]));
  const cell = (row, name) => row[header.indexOf(name)];
  expect(first).toHaveLength(header.length);
  expect(second).toHaveLength(header.length);
  expect(cell(first, 'Cover Letter')).toBe('My cover letter');
  expect(cell(first, '1st Choice Officer 1 Rating')).toBe('yes');
  expect(cell(first, '1st Choice Officer 2 Rating')).toBe('maybe');
  expect(cell(first, '1st Choice Notes')).toBe('Review notes');
  expect(cell(first, 'Dev: Why Dev?')).toBe('Dev answer');
  expect(cell(first, 'AI: Why AI?')).toBe('AI answer');
  expect(cell(first, 'Design: Why Design?')).toBe('Design answer');
  expect(cell(second, 'Dev: Why Dev?')).toBe('Second applicant');
  expect(cell(second, 'Dev: Updated question?')).toBe('Updated answer');
  expect(cell(first, 'Dev: Updated question?')).toBe('');
});

test('CSV preserves multiline answers and escapes formula-like applicant content', () => {
  const rows = buildApplicationSpreadsheetRows([{
    firstName: '=1+1', firstChoiceCommittee: 'dev',
    firstChoiceResponses: [{ questionKey: 'why', question: 'Why?', answer: 'Line one, "quoted"\nLine two' }],
  }], new Map());
  const csv = buildCsv(rows);
  expect(csv).toContain("'=1+1");
  expect(csv).toContain('"Line one, ""quoted""\nLine two"');
});
