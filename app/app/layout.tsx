import type { Metadata } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", display: "swap" });

export const metadata: Metadata = {
  title: "Professor de Tênis",
  description: "Painel de gamificação para professores de tênis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${dmSans.variable}`}>
      <body>{children}<ToastContainer /></body>
    </html>
  );
}
