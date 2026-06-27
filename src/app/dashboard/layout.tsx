import { requireSession } from "@/lib/session";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="flex min-h-screen flex-1 flex-col overflow-auto bg-background">
        {children}
      </div>
    </div>
  );
}
