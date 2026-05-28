import { NextResponse } from "next/server";
import { requireViewerSession } from "@/lib/session";
import { getCategories } from "@/lib/sheets";

export async function GET() {
  const viewer = await requireViewerSession();
  if (viewer.response) return viewer.response;

  return NextResponse.json({ categories: await getCategories() });
}
