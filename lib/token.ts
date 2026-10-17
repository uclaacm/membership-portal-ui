// Get claims from JSON Web Token (JWT)
// JWT is signed on backend, sent with every request, and verified on backend.
// The token carries no roles — they can change mid-session and a token can't. Read roles
// from the user record's accessType instead (accessTypeAtom on the client, fetchAccessType on the server).
function tokenGetClaims(token: string) {
  if (!token) {
    return {};
  }

  const tokenArray = token.split(".");
  if (tokenArray.length !== 3) return {};

  // Use Buffer for Node.js (server-side) and atob for browser
  const base64Payload = tokenArray[1].replace("-", "+").replace("_", "/");
  const decodedPayload = typeof window === "undefined" 
    ? Buffer.from(base64Payload, "base64").toString("utf-8")
    : window.atob(base64Payload);
  
  return JSON.parse(decodedPayload);
}

export function isAuthenticated(token: string | undefined): token is string {
  return !!token;
}

export function isTokenRegistered(token: string): boolean {
  return !!tokenGetClaims(token).registered;
}
