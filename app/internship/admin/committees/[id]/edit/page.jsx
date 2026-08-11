"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Internship/ProtectedRoute";
import CommitteeForm from "@/components/Internship/CommitteeForm";
import ConfirmationModal from "@/components/Modal/confirmationModal";
import fetchCommitteeById from "@/app/actions/internship/fetchCommitteeById";
import updateCommittee from "@/app/actions/internship/updateCommittee";
import archiveCommittee from "@/app/actions/internship/archiveCommittee";
import deleteCommittee from "@/app/actions/internship/deleteCommittee";
import "@/components/Internship/AdminDashboard.scss";

export default function EditCommitteePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [committee, setCommittee] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dangerError, setDangerError] = useState(null);
  const [dangerPending, setDangerPending] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "archive" | "delete" | null

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchCommitteeById(id);
      if (cancelled) return;
      if (result.success) {
        setCommittee(result.data);
      } else {
        setLoadError(result.error);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(payload) {
    const result = await updateCommittee(id, payload);
    if (result.success) {
      setCommittee(result.data);
    }
    return result;
  }

  async function handleConfirmDanger() {
    const action = confirmAction;
    setConfirmAction(null);
    setDangerPending(true);
    setDangerError(null);

    if (action === "archive") {
      const result = await archiveCommittee(id);
      setDangerPending(false);
      if (!result.success) {
        setDangerError(result.error);
        return;
      }
      window.alert(`Archived ${result.archivedCount} application${result.archivedCount === 1 ? "" : "s"} for this committee.`);
      return;
    }

    if (action === "delete") {
      const result = await deleteCommittee(id);
      setDangerPending(false);
      if (!result.success) {
        setDangerError(result.error);
        return;
      }
      router.push("/internship/admin");
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-dashboard">
        <h2>Edit Committee</h2>

        {loading && <div className="admin-dashboard__placeholder">Loading committee…</div>}
        {!loading && loadError && (
          <div className="committee-table-wrapper__error">{loadError}</div>
        )}

        {!loading && committee && (
          <>
            <CommitteeForm
              initialValues={committee}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
            />

            <div className="committee-form__danger-zone">
              <h3>Danger Zone</h3>
              {dangerError && <div className="committee-form__error">{dangerError}</div>}
              <div className="committee-form__danger-actions">
                <div className="committee-form__danger-row">
                  <div>
                    <strong>Archive this committee&apos;s applications</strong>
                    <p>
                      Marks the committee&apos;s current-cycle applications as archived. They&apos;ll
                      no longer appear in the current Applications view, but stay visible in the
                      past-cycles view. The committee itself is unaffected.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="committee-form__danger-btn"
                    disabled={dangerPending}
                    onClick={() => setConfirmAction("archive")}
                  >
                    Archive Applications
                  </button>
                </div>

                <div className="committee-form__danger-row">
                  <div>
                    <strong>Delete committee</strong>
                    <p>
                      Deactivates the committee (it stops accepting applications and disappears
                      from active lists). This does not delete any existing application data.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="committee-form__danger-btn committee-form__danger-btn--delete"
                    disabled={dangerPending}
                    onClick={() => setConfirmAction("delete")}
                  >
                    Delete Committee
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <ConfirmationModal
          opened={confirmAction !== null}
          title={confirmAction === "delete" ? "Delete this committee?" : "Archive this committee's applications?"}
          message={
            confirmAction === "delete"
              ? "This deactivates the committee. It will stop accepting applications and disappear from active lists. This can be undone by reactivating it later."
              : "This archives every current-cycle application for this committee. They'll be hidden from the current Applications view but remain visible in the past-cycles view."
          }
          submit={handleConfirmDanger}
          cancel={() => setConfirmAction(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
