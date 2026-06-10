import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar user={session.user} />
      <main className="px-4 py-6 sm:px-8 sm:py-8 lg:ml-64">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
