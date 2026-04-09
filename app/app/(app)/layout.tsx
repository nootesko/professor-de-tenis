"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const role = useAuth((s) => s.role);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && role !== "admin") router.replace("/login");
  }, [hydrated, role, router]);

  if (!hydrated) return null;
  if (role !== "admin") return null;

  return (
    <div className="min-h-screen bg-brand-mint">
      <Sidebar />
      <div className="md:pl-[230px]">
        <Topbar />
        <main className="px-6 pb-[calc(80px+env(safe-area-inset-bottom))] pt-2 md:px-10 md:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
