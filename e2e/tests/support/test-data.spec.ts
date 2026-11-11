import { test, expect } from "../../support/fixtures";
import { tokenFor } from "../../support/auth";

// Checks the shared testData fixture itself, so a broken fixture fails here with a clear
// message instead of in every feature test.
test.describe("testData fixture", () => {
  test("creates an event members can see, and deletes it afterwards", async ({ request, testData }) => {
    const event = await testData.createEvent();
    const asMember = { headers: { Authorization: `Bearer ${tokenFor("member")}` } };

    const found = await request.get(`/app/api/v1/event/${event.uuid}`, asMember);
    expect((await found.json()).event.title).toBe(event.title);

    await testData.cleanup();
    const gone = await request.get(`/app/api/v1/event/${event.uuid}`, asMember);
    expect((await gone.json()).event ?? null).toBeNull();
  });
});
