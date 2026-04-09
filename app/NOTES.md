# Professor de Tênis - Notas de Implementação

App Next.js 14 (App Router) + TypeScript + Tailwind, scaffolded manualmente
(sem `create-next-app`) para evitar prompts interativos.

## Decisões
- Estado global via Zustand (`lib/store.ts`), seed em `lib/mock-data.ts`.
- Fontes: Archivo (display) + DM Sans (sans) via `next/font/google`.
- Ícones: lucide-react.
- Layout shell em `app/(app)/layout.tsx` (sidebar fixa desktop, bottom nav mobile).
- Login standalone em `app/login` (sem sidebar). Submit redireciona para /dashboard.
- CRUD em memória (perde estado em refresh por design).
- Avatares: i.pravatar.cc.
- Cores brand extraídas do briefing e configuradas em `tailwind.config.ts`.

## Gaps conhecidos vs Figma
- Logo é placeholder de troféu lucide (sem SVG oficial).
- MiniCalendar simplificado (sem highlights de aula real).
- Multi-step de cadastro do aluno cobre 3 etapas (Dados, Endereço, Nível) sem
  upload de foto.
- Modal "Trocar Foto" do perfil é apenas um botão (sem fluxo completo).
- Avaliação de Desempenho usa estrelas com valores aleatórios na visualização.
- Algumas variações Off/Delete dos PNGs estão cobertas pelo `EmptyState` /
  `ConfirmDialog` genéricos.

## Rodar
```
cd app
npm run dev
# http://localhost:3000
```
