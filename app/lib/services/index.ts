// Service layer — business logic, validations, cascades.
// Services delegate to repositories for persistence and use the store-bridge
// for transactional cross-entity updates.

import type {
  Aluno, Turma, Professor, Nivel, Aula, Feedback, Avaliacao, CriterioAvaliacao, ProgramaRecompensas,
  TabelaNiveis, LancamentoPonto, PremioNivel, Premio,
} from '@/lib/types';
import { pontosDaAula, progresso, premiosEntre, conquistasParaCelebrar, type Conquista } from '@/lib/gamificacao';
import { toLocalISODate } from '@/lib/date';
import { getState, setState } from '@/lib/repositories/mock/store-bridge';
import {
  mockAlunoRepository,
  mockTurmaRepository,
  mockProfessorRepository,
  mockNivelRepository,
  mockTabelaNiveisRepository,
  mockLancamentoRepository,
  mockAulaRepository,
  mockFeedbackRepository,
  mockAvaliacaoRepository,
  mockCriterioRepository,
  mockAlunoCredRepository,
} from '@/lib/repositories/mock';

type FullState = {
  alunos: Aluno[];
  turmas: Turma[];
  professores: Professor[];
  niveis: Nivel[];
  aulas: Aula[];
  feedbacks: Feedback[];
  lancamentos: LancamentoPonto[];
  avaliacoes: Avaliacao[];
  alunoCreds: { alunoId: string; user: string; senha: string }[];
  tabela: TabelaNiveis;
  criterios: CriterioAvaliacao[];
  programa: ProgramaRecompensas;
};

const st = (): FullState => getState<FullState>();

export type ActionResult = { ok: boolean; error?: string };

// ---------------------------------------------------------------------------
// AlunoService
// ---------------------------------------------------------------------------
export const AlunoService = {
  emailExists(email: string, ignoreId?: string): boolean {
    const target = email.trim().toLowerCase();
    if (!target) return false;
    return st().alunos.some((a) => a.email.toLowerCase() === target && a.id !== ignoreId);
  },

  create(a: Aluno): ActionResult {
    if (this.emailExists(a.email)) return { ok: false, error: 'E-mail já cadastrado' };
    setState((prev) => {
      const s = prev as FullState;
      const next: Partial<FullState> = { alunos: [...s.alunos, a] };
      if (a.turmaId) {
        next.turmas = s.turmas.map((t) =>
          t.id === a.turmaId && !t.alunosIds.includes(a.id) ? { ...t, alunosIds: [...t.alunosIds, a.id] } : t,
        );
      }
      if (!s.alunoCreds.some((c) => c.alunoId === a.id)) {
        const user = (a.email?.split('@')[0] || `aluno-${a.id}`).toLowerCase();
        const senha = Math.random().toString(36).slice(2, 10);
        next.alunoCreds = [...s.alunoCreds, { alunoId: a.id, user, senha }];
      }
      if (a.pontos > 0) {
        // Pontos iniciais (saldo de antes do app) entram no histórico como ajuste.
        next.lancamentos = [
          ...s.lancamentos,
          {
            id: `lp${Date.now()}-${a.id}`, alunoId: a.id, tipo: 'ajuste', data: toLocalISODate(new Date()),
            anterior: 0, valor: a.pontos, registradoEm: new Date().toISOString(),
          },
        ];
      }
      return { ...s, ...next };
    });
    return { ok: true };
  },

  update(id: string, patch: Partial<Aluno>): ActionResult {
    if (patch.email && this.emailExists(patch.email, id)) {
      return { ok: false, error: 'E-mail já cadastrado' };
    }
    setState((prev) => {
      const s = prev as FullState;
      const previous = s.alunos.find((x) => x.id === id);
      const alunos = s.alunos.map((x) => (x.id === id ? { ...x, ...patch } : x));
      let turmas = s.turmas;
      if (previous && patch.turmaId !== undefined && patch.turmaId !== previous.turmaId) {
        turmas = s.turmas.map((t) => {
          if (t.id === previous.turmaId) return { ...t, alunosIds: t.alunosIds.filter((x) => x !== id) };
          if (t.id === patch.turmaId)
            return t.alunosIds.includes(id) ? t : { ...t, alunosIds: [...t.alunosIds, id] };
          return t;
        });
      }
      // Mudança direta do total vira um ajuste no histórico de pontos (valor anterior e corrigido).
      let lancamentos = s.lancamentos;
      if (previous && patch.pontos !== undefined && patch.pontos !== previous.pontos) {
        const agora = new Date().toISOString();
        lancamentos = [
          ...lancamentos,
          {
            id: `lp${Date.now()}-${id}`, alunoId: id, tipo: 'ajuste', data: toLocalISODate(new Date()),
            anterior: previous.pontos, valor: Math.max(0, patch.pontos), registradoEm: agora,
          },
        ];
      }
      return { ...s, alunos, turmas, lancamentos };
    });
    return { ok: true };
  },

  delete(id: string): ActionResult {
    setState((prev) => {
      const s = prev as FullState;
      return {
        ...s,
        alunos: s.alunos.filter((x) => x.id !== id),
        turmas: s.turmas.map((t) => ({ ...t, alunosIds: t.alunosIds.filter((x) => x !== id) })),
        feedbacks: s.feedbacks.filter((f) => f.alunoId !== id),
        aulas: s.aulas.map((au) => {
          const sem = <T,>(m: Record<string, T>) => {
            const c = { ...m };
            delete c[id];
            return c;
          };
          return {
            ...au,
            presenca: sem(au.presenca),
            notas: sem(au.notas),
            observacao: sem(au.observacao),
            ponto: sem(au.ponto),
            nivel: sem(au.nivel),
          };
        }),
        lancamentos: s.lancamentos.filter((l) => l.alunoId !== id),
        avaliacoes: s.avaliacoes.filter((a) => a.alunoId !== id),
        alunoCreds: s.alunoCreds.filter((c) => c.alunoId !== id),
      };
    });
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// TurmaService
// ---------------------------------------------------------------------------
export const TurmaService = {
  create(t: Turma): ActionResult {
    setState((prev) => {
      const s = prev as FullState;
      const alunos = s.alunos.map((a) => (t.alunosIds.includes(a.id) ? { ...a, turmaId: t.id } : a));
      return { ...s, turmas: [...s.turmas, t], alunos };
    });
    return { ok: true };
  },

  update(id: string, patch: Partial<Turma>): ActionResult {
    setState((prev) => {
      const s = prev as FullState;
      const previous = s.turmas.find((x) => x.id === id);
      const turmas = s.turmas.map((x) => (x.id === id ? { ...x, ...patch } : x));
      let alunos = s.alunos;
      if (previous && patch.alunosIds) {
        const oldSet = new Set(previous.alunosIds);
        const newSet = new Set(patch.alunosIds);
        alunos = s.alunos.map((a) => {
          if (newSet.has(a.id) && a.turmaId !== id) return { ...a, turmaId: id };
          if (oldSet.has(a.id) && !newSet.has(a.id) && a.turmaId === id) return { ...a, turmaId: undefined };
          return a;
        });
      }
      return { ...s, turmas, alunos };
    });
    return { ok: true };
  },

  delete(id: string): ActionResult {
    setState((prev) => {
      const s = prev as FullState;
      return {
        ...s,
        turmas: s.turmas.filter((x) => x.id !== id),
        alunos: s.alunos.map((a) => (a.turmaId === id ? { ...a, turmaId: undefined } : a)),
        aulas: s.aulas.filter((au) => au.turmaId !== id),
      };
    });
    return { ok: true };
  },

  assignAluno(alunoId: string, turmaId: string | null): ActionResult {
    const s = st();
    const aluno = s.alunos.find((a) => a.id === alunoId);
    if (!aluno) return { ok: false, error: 'Aluno não encontrado' };
    if (turmaId) {
      const turma = s.turmas.find((t) => t.id === turmaId);
      if (!turma) return { ok: false, error: 'Turma não encontrada' };
      const vagas = turma.vagas;
      if (typeof vagas === 'number' && turma.alunosIds.length >= vagas && !turma.alunosIds.includes(alunoId)) {
        return { ok: false, error: 'Turma sem vagas disponíveis' };
      }
    }
    setState((prev) => {
      const ss = prev as FullState;
      const turmas = ss.turmas
        .map((t) => {
          if (aluno.turmaId && t.id === aluno.turmaId)
            return { ...t, alunosIds: t.alunosIds.filter((x) => x !== alunoId) };
          return t;
        })
        .map((t) => {
          if (turmaId && t.id === turmaId && !t.alunosIds.includes(alunoId))
            return { ...t, alunosIds: [...t.alunosIds, alunoId] };
          return t;
        });
      const alunos = ss.alunos.map((a) => (a.id === alunoId ? { ...a, turmaId: turmaId ?? undefined } : a));
      return { ...ss, turmas, alunos };
    });
    return { ok: true };
  },

  hasCapacity(turmaId: string): boolean {
    const t = mockTurmaRepository.byId(turmaId);
    if (!t) return false;
    if (typeof t.vagas !== 'number') return true;
    return t.alunosIds.length < t.vagas;
  },
};

// ---------------------------------------------------------------------------
// ProfessorService
// ---------------------------------------------------------------------------
export const ProfessorService = {
  create(p: Professor): ActionResult {
    mockProfessorRepository.add(p);
    return { ok: true };
  },
  update(id: string, patch: Partial<Professor>): ActionResult {
    mockProfessorRepository.update(id, patch);
    return { ok: true };
  },
  delete(id: string): ActionResult {
    setState((prev) => {
      const s = prev as FullState;
      return {
        ...s,
        professores: s.professores.filter((x) => x.id !== id),
        turmas: s.turmas.map((t) => (t.professorId === id ? { ...t, professorId: '' } : t)),
        feedbacks: s.feedbacks.filter((f) => f.professorId !== id),
      };
    });
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// NivelService
// ---------------------------------------------------------------------------
export const NivelService = {
  create: (n: Nivel): ActionResult => (mockNivelRepository.add(n), { ok: true }),
  update: (id: string, patch: Partial<Nivel>): ActionResult => (mockNivelRepository.update(id, patch), { ok: true }),
  delete(id: string): ActionResult {
    setState((prev) => {
      const s = prev as FullState;
      return {
        ...s,
        niveis: s.niveis.filter((x) => x.id !== id),
        alunos: s.alunos.map((a) => (a.nivelId === id ? { ...a, nivelId: '' } : a)),
        turmas: s.turmas.map((t) => (t.nivelId === id ? { ...t, nivelId: '' } : t)),
      };
    });
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// AvaliacaoService
// ---------------------------------------------------------------------------
export const AvaliacaoService = {
  create: (a: Avaliacao): ActionResult => (mockAvaliacaoRepository.add(a), { ok: true }),
  delete: (id: string): ActionResult => (mockAvaliacaoRepository.remove(id), { ok: true }),
};

// ---------------------------------------------------------------------------
// TabelaNiveisService — tabela de níveis sem limite, editável nível a nível
// ---------------------------------------------------------------------------
export const TabelaNiveisService = {
  /** Configura o prêmio de um nível. `null` = nível sem prêmio (conta normalmente, sem aviso). */
  definirNivel(nivel: number, premio: PremioNivel | null): ActionResult {
    if (!Number.isInteger(nivel) || nivel < 1) return { ok: false, error: 'Nível inválido' };
    const t = mockTabelaNiveisRepository.get();
    mockTabelaNiveisRepository.set({ ...t, niveis: { ...t.niveis, [nivel]: premio } });
    return { ok: true };
  },
  /** Remove a configuração do nível: ele volta a seguir a regra do bloco. */
  usarRegra(nivel: number): ActionResult {
    const t = mockTabelaNiveisRepository.get();
    const niveis = { ...t.niveis };
    delete niveis[nivel];
    mockTabelaNiveisRepository.set({ ...t, niveis });
    return { ok: true };
  },
  definirFaixa(indice: number, premio: PremioNivel): ActionResult {
    const t = mockTabelaNiveisRepository.get();
    if (!t.faixas[indice]) return { ok: false, error: 'Faixa não encontrada' };
    mockTabelaNiveisRepository.set({ ...t, faixas: t.faixas.map((f, i) => (i === indice ? { ...f, premio } : f)) });
    return { ok: true };
  },
};

// ---------------------------------------------------------------------------
// AulaService
// ---------------------------------------------------------------------------
export const AulaService = {
  upsert(a: Aula): ActionResult {
    mockAulaRepository.upsert(a);
    return { ok: true };
  },
  delete: (id: string): ActionResult => (mockAulaRepository.remove(id), { ok: true }),

  /**
   * Salva o registro da aula e aplica as consequências de cada vertente, sem misturá-las:
   * - pontos: soma/subtrai a diferença em relação ao registro anterior desta aula e grava o lançamento
   *   (na correção, com o valor anterior e o corrigido);
   * - nível técnico: atualiza a bola atual do aluno (não mexe em pontos nem prêmios);
   * - conquistas: não são gravadas; saem do histórico + tabela. Aqui só se calcula o que comemorar:
   *   todos os níveis com prêmio atravessados (ex.: de 46 para 49 inclui o 48).
   */
  finalizar(aula: Aula): { conquistas: Conquista[] } {
    const s0 = st();
    const anterior = s0.aulas.find((a) => a.id === aula.id);
    const alunoIds = Object.keys(aula.presenca);
    const antes = new Map(
      alunoIds.map((id) => {
        const al = s0.alunos.find((x) => x.id === id);
        return [id, al ? progresso(s0.programa.unidade, al, s0.aulas) : 0];
      }),
    );
    const agora = new Date().toISOString();
    let seq = 0;

    setState((prev) => {
      const s = prev as FullState;
      const aulas = s.aulas.some((a) => a.id === aula.id)
        ? s.aulas.map((a) => (a.id === aula.id ? aula : a))
        : [...s.aulas, aula];
      const novos: LancamentoPonto[] = [];
      const alunos = s.alunos.map((al) => {
        if (!alunoIds.includes(al.id)) return al;
        const de = anterior ? pontosDaAula(anterior, al.id) : null;
        const para = pontosDaAula(aula, al.id);
        if ((de ?? 0) !== para) {
          novos.push({
            id: `lp${Date.now()}-${(seq += 1)}`, alunoId: al.id, tipo: 'aula', aulaId: aula.id, data: aula.data,
            anterior: de, valor: para, registradoEm: agora,
          });
        }
        const delta = para - (de ?? 0);
        const nivelId = aula.nivel[al.id] || al.nivelId;
        return delta === 0 && nivelId === al.nivelId ? al : { ...al, pontos: Math.max(0, al.pontos + delta), nivelId };
      });
      return { ...s, aulas, alunos, lancamentos: [...s.lancamentos, ...novos] };
    });

    const s1 = st();
    const porAluno: { alunoId: string; premios: Premio[] }[] = [];
    for (const id of alunoIds) {
      const al = s1.alunos.find((x) => x.id === id);
      if (!al) continue;
      const depois = progresso(s1.programa.unidade, al, s1.aulas);
      porAluno.push({ alunoId: id, premios: premiosEntre(s1.tabela, antes.get(id) ?? 0, depois) });
    }
    return { conquistas: conquistasParaCelebrar(s1.programa, porAluno) };
  },
};

// Re-export repos for tests / advanced usage
export {
  mockAlunoRepository,
  mockTurmaRepository,
  mockProfessorRepository,
  mockNivelRepository,
  mockTabelaNiveisRepository,
  mockLancamentoRepository,
  mockAulaRepository,
  mockFeedbackRepository,
  mockAvaliacaoRepository,
  mockCriterioRepository,
  mockAlunoCredRepository,
};
