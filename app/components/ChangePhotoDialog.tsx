"use client";
import { useState } from "react";
import { Card, AvatarUpload, Button } from "./ui";
import { X } from "lucide-react";

export function ChangePhotoDialog({
  open, current, alt, onClose, onSave,
}: {
  open: boolean;
  current?: string;
  alt: string;
  onClose: () => void;
  onSave: (src: string | undefined) => void;
}) {
  const [value, setValue] = useState<string | undefined>(current);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-fade-in">
      <Card className="w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-bold text-brand">Trocar foto</h3>
          <button type="button" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        </div>
        <div className="mt-4 grid place-items-center">
          <AvatarUpload value={value} onChange={setValue} alt={alt} size={120} fallback={current} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={() => { onSave(value); onClose(); }}>Salvar</Button>
        </div>
      </Card>
    </div>
  );
}
