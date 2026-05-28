import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { HymnExplorer } from "@/components/hymn-explorer";
import { authOptions } from "@/lib/auth";
import { requireLoginToView } from "@/lib/config";
import { getCategories, getHymns } from "@/lib/sheets";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (requireLoginToView() && !session) {
    redirect("/api/auth/signin");
  }

  const [hymns, categories] = await Promise.all([getHymns(), getCategories()]);
  return <HymnExplorer hymns={hymns} categories={categories} />;
}
