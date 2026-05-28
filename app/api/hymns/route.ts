import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getHymns, isAdmin, upsertHymn } from "@/lib/sheets";
import { hymnInputSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ hymns: await getHymns() });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!(await isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = hymnInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const hymn = await upsertHymn(parsed.data, session?.user?.email ?? "unknown");
    return NextResponse.json({ hymn });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save hymn" }, { status: 500 });
  }
}
