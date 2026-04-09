'use client';
import { X, Trash2 } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in">
      <Card className="w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-xl font-bold text-brand">{title}</h3>
          <button onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-700">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            <Trash2 size={14} /> Excluir
          </Button>
        </div>
      </Card>
    </div>
  );
}
