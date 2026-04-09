import { BrandMark } from "@/components/ui";

export default function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-brand-mint">
      <header className="flex h-16 w-full items-center bg-brand px-4 md:px-6">
        <BrandMark variant="onDark" />
      </header>
      <main className="relative mx-auto w-full max-w-3xl pb-28 md:max-w-4xl">
        {children}
      </main>
    </div>
  );
}
