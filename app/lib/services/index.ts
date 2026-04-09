// Service layer — business logic, validations, cascades.
// Services delegate to repositories for persistence and use the store-bridge
// for transactional cross-entity updates.

import type { Aluno, Turma, Professor, Nivel, Aula, Feedback, Premiacao, Avaliacao, Premio, CriterioAvaliacao } from '@/lib/types';
import { getState, setState } from '@/lib/repositories/mock/store-bridge';
import {
  mockAlunoRepository,
  mockTurmaRepository,
  mockProfessorRepository,
  mockNivelRepository,
  mockPremioRepository,
  mockPremiacaoRepository,
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
  premiacoes: Premiacao[];
  avaliacoes: Avaliacao[];
  alunoCreds: { alunoId: string; user: string; senha: string }[];
  premios: Premio[];
  criterios: CriterioAvaliacao[];
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
      return { ...s, alunos, turmas };
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
          const presenca = { ...au.presenca };
          delete presenca[id];
          const pontos = { ...au.pontos };
          delete pontos[id];
          const stars = { ...au.stars };
          delete stars[id];
          return { ...au, presenca, pontos, stars };
        }),
        premiacoes: s.premiacoes.filter((p) => p.alunoId !== id),
        avaliacoes: s.avaliacoes.filter((a) => a.alunoId !== id),
        alunoCreds: s.alunoCreds.filter((c) => c.alunoId !== id),
      };
    });
    return { ok: true };
  },

  addPontos(id: string, delta: number): ActionResult {
    const a = mockAlunoRepository.byId(id);
    if (!a) return { ok: false, error: 'Aluno não encontrado' };
    mockAlunoRepository.update(id, { pontos: Math.max(0, a.pontos + delta) });
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
// PremiacaoService
// ---------------------------------------------------------------------------
export const PremiacaoService = {
  grant(p: Premiacao): ActionResult {
    mockPremiacaoRepository.add(p);
    return { ok: true };
  },
  revoke: (id: string): ActionResult => (mockPremiacaoRepository.remove(id), { ok: true }),
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
};

// Re-export repos for tests / advanced usage
export {
  mockAlunoRepository,
  mockTurmaRepository,
  mockProfessorRepository,
  mockNivelRepository,
  mockPremioRepository,
  mockPremiacaoRepository,
  mockAulaRepository,
  mockFeedbackRepository,
  mockAvaliacaoRepository,
  mockCriterioRepository,
  mockAlunoCredRepository,
};
