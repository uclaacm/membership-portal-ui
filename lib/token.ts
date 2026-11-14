// Get claims from JSON Web Token (JWT)
// JWT is signed on backend, sent with every request, and verified on backend
function tokenGetClaims(token: string): Record<string, unknown> {
  if (!token) {
    return {};
  }

  const tokenArray = token.split(".");
  if (tokenArray.length !== 3) return {};

  // Use Buffer for Node.js (server-side) and atob for browser
  try {
    const base64Payload = tokenArray[1].replace(/-/g, "+").replace(/_/g, "/"); // can't replaceAll so we use regex global flag
    const decodedPayload = typeof window === "undefined"
      ? Buffer.from(base64Payload, "base64").toString("utf-8")
      : window.atob(base64Payload);
    const claims = JSON.parse(decodedPayload);
    return claims && typeof claims === "object" && !Array.isArray(claims) ? claims : {};
  } catch {
    return {};
  }
}

export function tokenExpiresAt(token: string): number | null {
  const exp = tokenGetClaims(token).exp;
  return typeof exp === "number" && Number.isFinite(exp) && Number.isFinite(exp * 1000)
    ? exp * 1000
    : null;
}

export function isAuthenticated(token: string | undefined): token is string {
  return !!token && (tokenExpiresAt(token) ?? 0) > Date.now();
}

export function isTokenAdmin(token: string): boolean {
  return !!tokenGetClaims(token).admin;
}

export function isTokenSuperAdmin(token: string): boolean {
  return !!tokenGetClaims(token).superAdmin;
}

export function isTokenRegistered(token: string): boolean {
  return !!tokenGetClaims(token).registered;
}

export function isTokenOfficer(token: string): boolean {
  return !!tokenGetClaims(token).officer;
}
