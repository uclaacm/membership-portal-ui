/** @jest-environment jsdom */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import CareerLanding from "../app/profile/CareerLanding";
import Profile from "../app/profile/profile";
import UnsavedChangesGuard from "../components/UnsavedChangesGuard";
import CareerEditPage from "../app/profile/career/edit/page";
import fetchCareerProfile from "../app/actions/user/fetchCareerProfile";
import updateCareerProfile from "../app/actions/user/updateCareerProfile";

jest.mock("../app/profile/activities", () => ({ __esModule: true, default: () => null }));
jest.mock("../app/home/components/NeuralBackground", () => ({ __esModule: true, default: () => null }));
jest.mock("../lib/hooks/useCommitteeDirectory", () => ({
  __esModule: true,
  default: () => ({ styleFor: () => ({}) }),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, ...props }) => <a {...props}>{children}</a> }));
jest.mock("../components/Topbar", () => ({ __esModule: true, default: () => null }));
jest.mock("../lib/atoms", () => ({ authUserProfileAtom: "user", isAdminAtom: "admin", isOfficerAtom: "officer" }));
jest.mock("jotai", () => {
  const user = { firstName: "Test", lastName: "Member" };
  return { useAtomValue: atom => (atom === "user" ? user : false), useSetAtom: () => jest.fn() };
});
jest.mock("../app/actions/user/fetchCareerProfile", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../app/actions/user/updateCareerProfile", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../app/actions/auth/logoutUser", () => ({ __esModule: true, default: jest.fn() }));

let root, container;
const mount = async element => {
  await act(async () => {
    root.render(element);
  });
};
const click = async element => {
  await act(async () => {
    element.click();
  });
};
const fill = async (id, value) => {
  await act(async () => {
    const input = document.getElementById(id);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};
const buttons = text => [...container.querySelectorAll("button")].filter(button => button.textContent.includes(text));
const unload = () => {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.history.replaceState(null, "", "/");
  Element.prototype.scrollIntoView = jest.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  fetchCareerProfile.mockResolvedValue({
    linkedinUrl: "https://linkedin.com/in/member",
    githubUrl: "https://github.com/member",
    isProfilePublic: false,
  });
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  jest.restoreAllMocks();
});

test("unload protection only exists while dirty and cleans up on unmount", async () => {
  await mount(<UnsavedChangesGuard dirty={false} />);
  expect(unload()).toBe(false);
  await mount(<UnsavedChangesGuard dirty />);
  expect(unload()).toBe(true);
  await mount(<UnsavedChangesGuard dirty={false} />);
  expect(unload()).toBe(false);
});

test("in-app navigation can be cancelled, while checklist hashes do not prompt", async () => {
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
  await mount(
    <>
      <UnsavedChangesGuard dirty />
      <a href="/resources">Leave</a>
      <a href="#bio">Checklist</a>
    </>
  );
  const linkEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
  container.querySelector("a").dispatchEvent(linkEvent);
  expect(linkEvent.defaultPrevented).toBe(true);
  expect(confirm).toHaveBeenCalledTimes(1);
  container.querySelectorAll("a")[1].click();
  expect(confirm).toHaveBeenCalledTimes(1);
});

test("career controls reflect edits, reversion, tag drafts, and Cancel", async () => {
  await mount(<CareerEditPage />);
  expect(buttons("Cancel")).toHaveLength(0);
  expect(buttons("Save Changes").every(button => button.disabled)).toBe(true);
  await fill("pronouns", "they/them");
  expect(buttons("Cancel")).toHaveLength(1);
  expect(buttons("Save Changes").every(button => !button.disabled)).toBe(true);
  expect(unload()).toBe(true);
  await fill("pronouns", "");
  expect(buttons("Cancel")).toHaveLength(0);
  expect(unload()).toBe(false);
  await fill("skillInput", "TypeScript");
  expect(buttons("Cancel")).toHaveLength(1);
  await click(buttons("Cancel")[0]);
  expect(document.getElementById("skillInput").value).toBe("");
  expect(buttons("Cancel")).toHaveLength(0);
  expect(buttons("Save Changes").every(button => button.disabled)).toBe(true);
  expect(unload()).toBe(false);
});

test("failed saves retain dirty protection; successful saves clear it and include pending tags", async () => {
  jest.useFakeTimers();
  try {
    await mount(<CareerEditPage />);
    await fill("skillInput", "TypeScript");
    updateCareerProfile.mockResolvedValueOnce({ success: false, error: "Try again" });
    const submit = async () => {
      await act(async () => {
        document
          .getElementById("career-profile-form")
          .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
    };
    await submit();
    expect(container.querySelector('[role="alert"]').textContent).toContain("Try again");
    expect(unload()).toBe(true);
    expect(buttons("Save Changes").every(button => !button.disabled)).toBe(true);
    updateCareerProfile.mockResolvedValueOnce({ success: true });
    await submit();
    expect(updateCareerProfile).toHaveBeenLastCalledWith(expect.objectContaining({ skills: ["TypeScript"] }));
    expect(unload()).toBe(false);
    expect(buttons("Cancel")).toHaveLength(0);
    expect(buttons("Saved").every(button => button.disabled)).toBe(true);
  } finally {
    jest.useRealTimers();
  }
});

test("basic profile edits, reversion, Cancel, and failed saves track unsaved state", async () => {
  const profile = {
    name: "Test Member",
    firstName: "Test",
    lastName: "Member",
    year: 3,
    major: "Computer Science",
    points: 0,
  };
  const saveChanges = jest.fn().mockResolvedValue(false);
  await mount(<Profile profile={profile} saveChanges={saveChanges} activity={[]} />);
  expect(buttons("Cancel")).toHaveLength(0);
  expect(buttons("Save Changes")[0].disabled).toBe(true);
  await fill("profile-name", "Test Member Jr");
  expect(buttons("Cancel")).toHaveLength(1);
  expect(buttons("Save Changes")[0].disabled).toBe(false);
  expect(unload()).toBe(true);
  await fill("profile-name", "Test Member");
  expect(unload()).toBe(false);
  expect(buttons("Save Changes")[0].disabled).toBe(true);
  await fill("profile-name", "Test Member Jr");
  await act(async () => {
    container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  expect(saveChanges).toHaveBeenCalled();
  expect(unload()).toBe(true);
  await click(buttons("Cancel")[0]);
  expect(document.getElementById("profile-name").value).toBe("Test Member");
  expect(unload()).toBe(false);
});

test("career outbound links include UTM attribution and preserve destination parameters and hashes", () => {
  container.innerHTML = renderToStaticMarkup(
    <CareerLanding
      profile={{
        resumeUrl: "https://example.com/resume?id=123#page=2",
        linkedinUrl: "https://linkedin.com/in/member",
        portfolioUrl: "https://example.com/portfolio",
        personalWebsite: "https://example.com/",
        githubUrl: "https://github.com/member",
      }}
    />
  );
  const external = [...container.querySelectorAll('a[target="_blank"]')];
  expect(external).toHaveLength(5);
  for (const link of external) {
    const url = new URL(link.href);
    expect(url.searchParams.get("utm_source")).toBe("uclaacm");
    expect(url.searchParams.get("utm_medium")).toBe("referral");
    expect(url.searchParams.has("utm_campaign")).toBe(false);
  }
  const resume = new URL(external.find(link => link.textContent.includes("Resume")).href);
  expect(resume.searchParams.get("id")).toBe("123");
  expect(resume.hash).toBe("#page=2");
  expect(container.querySelector('a[href="/profile/career/edit"]')).not.toBeNull();
});
