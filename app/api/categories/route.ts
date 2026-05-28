import { NextResponse } from "next/server";
import { getCategories } from "@/lib/sheets";

export async function GET() {
  return NextResponse.json({ categories: await getCategories() });
}
