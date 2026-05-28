import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { requireLoginToView } from "@/lib/config";
import { isAuthorizedUser } from "@/lib/sheets";

type ViewerSessionResult = {
  response: NextResponse | null;
  session: Session | null;
};

export async function requireViewerSession(): Promise<ViewerSessionResult> {
  const session = await getServerSession(authOptions);

  if (!requireLoginToView()) {
    return { response: null, session };
  }

  if (!session?.user?.email) {
    return {
      response: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
      session: null
    };
  }

  if (!(await isAuthorizedUser(session.user.email))) {
    return {
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }),
      session: null
    };
  }

  return { response: null, session };
}
