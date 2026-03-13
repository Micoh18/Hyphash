import { Sidebar } from "@/components/nav/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="relative flex-1 min-h-0 overflow-auto">{children}</main>
    </div>
  );
}
