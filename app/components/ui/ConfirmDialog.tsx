'use client';
import { X, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Excluir',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    // Foco inicial no "Cancelar": ação destrutiva nunca é o padrão.
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 p-4 animate-fade-in" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-dialog bg-white p-6 animate-scale-in"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-xl font-bold text-brand">{title}</h2>
          <button type="button" onClick={onCancel} aria-label="Fechar" className="grid h-8 w-8 place-items-center rounded-full hover:bg-soft">
            <X size={18} />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-700">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelRef} variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>
            <Trash2 size={14} /> {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
