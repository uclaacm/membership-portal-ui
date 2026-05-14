"use client";

import { atom } from "jotai";

import type { MyInternshipApplication } from "@/lib/types/Internship";
import type { UserExtendedProfile, UserPublicProfile } from "@/lib/types/User";

export const authUserProfileAtom = atom<UserPublicProfile | UserExtendedProfile | null>(null);
export const isAdminAtom = atom<boolean>(false);
export const isOfficerAtom = atom<boolean>(false);
export const adminViewAtom = atom<boolean>(false);
export const officerViewAtom = atom<boolean>(false);
export const myInternshipApplicationAtom = atom<MyInternshipApplication | null>(null);
