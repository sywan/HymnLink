import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { requireViewerSession } from "@/lib/session";
import { deleteHymn, getHymn, isAdmin } from "@/lib/sheets";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const viewer = await requireViewerSession();
  if (viewer.response) return viewer.response;

  const hymn = await getHymn(params.id);
  if (!hymn) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ hymn });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await deleteHymn(params.id, session?.user?.email ?? "unknown");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete hymn" }, { status: 500 });
  }
}
