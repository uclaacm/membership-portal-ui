/**
 * Normalizes backend error payloads: `{ error }` or express-validator `{ success: false, errors: [...] }`.
 */
export function formatEventApiFailure(data: any, status: number): string {
  if (data?.error != null && data.error !== "") {
    if (typeof data.error === "object" && data.error !== null) {
      return data.error.message ?? JSON.stringify(data.error);
    }
    return String(data.error);
  }
  if (data?.success === false && Array.isArray(data?.errors)) {
    const parts = data.errors
      .map((e: any) => (typeof e === "string" ? e : e?.msg ?? e?.message))
      .filter(Boolean);
    if (parts.length) return parts.join("; ");
  }
  return `Request failed (${status})`;
}

export function hasApiError(data: any): boolean {
  if (data == null) return false;
  if (data.error != null && data.error !== "") return true;
  if (data.success === false) return true;
  return false;
}
