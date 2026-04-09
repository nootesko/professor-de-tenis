"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastState = {
  toasts: Toast[];
  push: (kind: ToastKind, message: string) => void;
  remove: (id: number) => void;
};

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, message) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(() => get().remove(id), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m: string) => useToast.getState().push("success", m),
  error: (m: string) => useToast.getState().push("error", m),
  info: (m: string) => useToast.getState().push("info", m),
};

export function ToastContainer() {
  const { toasts, remove } = useToast();
  useEffect(() => {}, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? XCircle : Info;
        const cls =
          t.kind === "success" ? "bg-brand text-white"
          : t.kind === "error" ? "bg-red-600 text-white"
          : "bg-white text-ink-700 border border-line";
        return (
          <button
            key={t.id}
            onClick={() => remove(t.id)}
            className={`pointer-events-auto flex items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-semibold shadow-soft animate-fade-in ${cls}`}
          >
            <Icon size={16} /> {t.message}
          </button>
        );
      })}
    </div>
  );
}
