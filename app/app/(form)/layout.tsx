import AppShell from "@/components/AppShell";

/** Formulários ficam dentro do mesmo shell do painel (e protegidos pelo mesmo login). */
export default function FormLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
