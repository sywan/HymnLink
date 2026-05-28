import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { HymnExplorer } from "@/components/hymn-explorer";
import { authOptions } from "@/lib/auth";
import { requireLoginToView } from "@/lib/config";
import { getCategories, getHymns, isAuthorizedUser } from "@/lib/sheets";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const loginRequired = requireLoginToView();

  if (loginRequired) {
    if (!session?.user?.email) {
      redirect("/api/auth/signin");
    }
    if (!(await isAuthorizedUser(session.user.email))) {
      redirect("/auth/error?error=AccessDenied");
    }
  }

  const [hymns, categories] = await Promise.all([getHymns(), getCategories()]);
  return <HymnExplorer hymns={hymns} categories={categories} />;
}
