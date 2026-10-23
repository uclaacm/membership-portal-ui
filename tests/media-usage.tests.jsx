import { imageEventReferences, isImageExpired } from '../app/controlpanel/mediaUsage';

const uuid = '12345678-abcd-abcd-abcd-123456789abc';
const image = { uuid };
const now = Date.parse('2026-10-22T12:00:00Z');
const event = (endDate, cover = `/app/api/v1/image/raw/${uuid}`) => ({ cover, endDate });
const expired = (events, file = image) => isImageExpired(file, imageEventReferences(events), now);

describe('Expired media', () => {
  test('includes images used exclusively by completed events, across URL origins', () => {
    expect(expired([
      event('2026-10-20T12:00:00Z'),
      event('2026-10-21T12:00:00Z', `https://portal.example/api/v1/image/raw/${uuid}?v=1`),
    ], { ...image, referenceCount: 2 })).toBe(true);
  });

  test('excludes unused images and unrelated covers', () => {
    expect(expired([])).toBe(false);
    expect(expired([event('2026-10-20T12:00:00Z', 'https://example.com/cover.png')])).toBe(false);
  });

  test.each(['2026-10-23T12:00:00Z', '2026-10-22T12:00:00Z', '', undefined, 'invalid'])(
    'excludes images with an ongoing, upcoming, or unknown end time: %s',
    (endDate) => {
      expect(expired([event('2026-10-20T12:00:00Z'), event(endDate)])).toBe(false);
    },
  );

  test('uses the end time even when an event has already started', () => {
    expect(expired([{ ...event('2026-10-23T12:00:00Z'), startDate: '2026-10-21T12:00:00Z' }])).toBe(false);
  });

  test('excludes images when some reported references cannot be checked', () => {
    expect(expired([event('2026-10-20T12:00:00Z')], { ...image, referenceCount: 2 })).toBe(false);
  });
});
