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

## Gamificação (spec BrincaTênis, 2026-11-26)
Referência: `Gamificacao_BrincaTenis_Especificacao.pdf`. Três vertentes independentes por aula e aluno:
1. **Desempenho**: presença + critérios 0–5 (ativos, configuráveis em Avaliações) + observação.
   Média só dos critérios preenchidos (`mediaNotas`), em branco não é zero.
2. **Ponto de gamificação**: o professor concede ou não (checkbox). Presença sozinha não dá ponto.
3. **Nível técnico**: bola registrada na aula; atualiza `aluno.nivelId`, nunca pontos/notas/prêmios.

- Regras puras em `lib/gamificacao.ts`; efeitos em `AulaService.finalizar` (testes em `tests/services/Gamificacao.test.ts`).
- Programa (`store.programa`): unidade `pontos` | `aulas`, celebração `todo-ponto` | `marcos` | `contador`.
- Sequência inicial: 32 marcos (`sequenciaBrincaTenis`), editáveis em Prêmios. Conquistar não zera.
- Premiações nunca são apagadas: correção de aula ou ação manual anula com motivo e histórico.
- Comemoração: `components/Celebracao.tsx` (confete/fogos/estrelas ou GIF por marco).
- Gráficos: `components/ui/LineChart.tsx` no perfil do aluno, com filtro de período.
- Seed: 14 semanas de aulas determinísticas por turma para os gráficos terem dados.

### Atualização: resumo prático para o desenvolvedor (2026-11-27)
- Pontos por aula são quantidade (0, 1, 2, 3…, sem teto) em `Aula.ponto: Record<aluno, number>`; só contam com presença.
- Total acumulado = nível de gamificação. Tabela sem limite em `TabelaNiveis` (`lib/types.ts`): regra do bloco de 16
  (1–5 pequena, 6–10 média, 11–15 grande) + configuração nível a nível (`niveis[n]`, `null` = sem prêmio).
  Especiais semeados até o 176 (`tabelaBrincaTenis()`); 192 em diante ficam em branco até o professor configurar.
- Conquistas não são gravadas: `conquistasDoAluno()` calcula a partir das aulas + tabela. Saldo anterior ao app
  (pontos iniciais/ajuste) vira conquistas sem data. Não existe mais "Premiar aluno" manual nem anular/restaurar.
- Histórico de pontos em `lancamentos` (`LancamentoPonto`): cada lançamento por aluno/aula; correção grava
  `anterior` e `valor`. Mudar o total no cadastro do aluno vira lançamento do tipo "ajuste".
- Vários pontos na mesma aula comemoram todos os níveis com prêmio atravessados (46 → 49 inclui o 48).
  Níveis sem prêmio não geram aviso.
- Menu "Níveis" (nível técnico) passou a se chamar "Bolas".
