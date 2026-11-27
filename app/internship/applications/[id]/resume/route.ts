import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";

// Opens an application's resume PDF in the browser.
//
// The API only accepts the session token as a Bearer header, which a plain link can't send, so
// this handler reads it from the cookie and passes the PDF through. Who may see which resume is
// decided by the API (the applicant, admins, and officers of a committee the applicant chose).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get("token")?.value;

  if (!isAuthenticated(token)) {
    return new Response("Sign in to view this resume.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const upstream = await fetch(
      `${Config.API_URL}${Config.routes.internship.applications}/${encodeURIComponent(id)}/resume`,
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!upstream.ok) {
      const data = await upstream.json().catch(() => null);
      return new Response(data?.message || "Could not load this resume.", {
        status: upstream.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition);
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    Logger.error(`resume GET failed: ${(err as Error).message}`);
    return new Response("Could not load this resume.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
