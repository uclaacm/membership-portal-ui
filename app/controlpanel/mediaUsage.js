/** Group event cover references by uploaded image UUID, regardless of URL origin. */
export function imageEventReferences(events) {
  const references = new Map();
  events.forEach((event) => {
    const match = String(event.cover || '').match(/\/image\/raw\/([0-9a-f-]{36})(?=[/?#]|$)/i);
    if (!match) return;
    const uuid = match[1].toLowerCase();
    if (!references.has(uuid)) references.set(uuid, []);
    references.get(uuid).push(event);
  });
  return references;
}

/** Unknown dates or references must not make an image look expired. */
export function isImageExpired(image, references, now = Date.now()) {
  const events = references.get(String(image.uuid).toLowerCase()) || [];
  if (events.length === 0 || (image.referenceCount ?? 0) > events.length) return false;
  return events.every((event) => event.endDate && new Date(event.endDate).getTime() < now);
}
