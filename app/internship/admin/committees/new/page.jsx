"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Internship/ProtectedRoute";
import CommitteeForm from "@/components/Internship/CommitteeForm";
import createCommittee from "@/app/actions/internship/createCommittee";
import useCommitteeDirectory from "@/lib/hooks/useCommitteeDirectory";
import "@/components/Internship/AdminDashboard.scss";

export default function NewCommitteePage() {
  const router = useRouter();
  const { refresh: refreshCommitteeDirectory } = useCommitteeDirectory();

  async function handleSubmit(payload) {
    const result = await createCommittee(payload);
    if (result.success) {
      // Officers can be assigned to it and events filed under it as soon as it exists.
      refreshCommitteeDirectory();
      router.push("/internship/admin");
    }
    return result;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-dashboard">
        <h2>Create Committee</h2>
        <CommitteeForm submitLabel="Create Committee" onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
}
