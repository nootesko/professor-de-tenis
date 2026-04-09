'use client';
import { create } from 'zustand';
import {
  alunos as alunosSeed,
  turmas as turmasSeed,
  professores as profsSeed,
  niveis as niveisSeed,
  premios as premiosSeed,
  criterios as critSeed,
  feedbacks as fbSeed,
  aulas as aulasSeed,
  premiacoes as premSeed,
  avaliacoes as avalSeed,
  alunoCreds as credsSeed,
} from './mock-data';
import type {
  Aluno,
  Turma,
  Professor,
  Nivel,
  Premio,
  CriterioAvaliacao,
  Feedback,
  Aula,
  Premiacao,
  Avaliacao,
  AlunoCred,
} from './types';
import { bindStore } from './repositories/mock/store-bridge';
import {
  AlunoService,
  TurmaService,
  ProfessorService,
  NivelService,
  AvaliacaoService,
  PremiacaoService,
  AulaService,
} from './services';

type State = {
  alunos: Aluno[];
  turmas: Turma[];
  professores: Professor[];
  niveis: Nivel[];
  premios: Premio[];
  criterios: CriterioAvaliacao[];
  feedbacks: Feedback[];
  aulas: Aula[];
  premiacoes: Premiacao[];
  avaliacoes: Avaliacao[];
  alunoCreds: AlunoCred[];

  upsertAula: (a: Aula) => void;
  deleteAula: (id: string) => void;

  addAluno: (a: Aluno) => void;
  updateAluno: (id: string, a: Partial<Aluno>) => void;
  deleteAluno: (id: string) => void;

  addTurma: (t: Turma) => void;
  updateTurma: (id: string, t: Partial<Turma>) => void;
  deleteTurma: (id: string) => void;

  addProfessor: (p: Professor) => void;
  updateProfessor: (id: string, p: Partial<Professor>) => void;
  deleteProfessor: (id: string) => void;

  addNivel: (n: Nivel) => void;
  updateNivel: (id: string, n: Partial<Nivel>) => void;
  deleteNivel: (id: string) => void;

  addPremio: (p: Premio) => void;
  deletePremio: (id: string) => void;

  addCriterio: (c: CriterioAvaliacao) => void;
  deleteCriterio: (id: string) => void;

  addFeedback: (f: Feedback) => void;
  deleteFeedback: (id: string) => void;

  addPremiacao: (p: Premiacao) => void;
  deletePremiacao: (id: string) => void;

  addAvaliacao: (a: Avaliacao) => void;
  deleteAvaliacao: (id: string) => void;

  assignAlunoToTurma: (alunoId: string, turmaId: string | null) => { ok: boolean; error?: string };

  emailExists: (email: string, ignoreAlunoId?: string) => boolean;
};

export const useStore = create<State>((set, get) => ({
  alunos: alunosSeed,
  turmas: turmasSeed,
  professores: profsSeed,
  niveis: niveisSeed,
  premios: premiosSeed,
  criterios: critSeed,
  feedbacks: fbSeed,
  aulas: aulasSeed,
  premiacoes: premSeed,
  avaliacoes: avalSeed,
  alunoCreds: credsSeed,

  upsertAula: (a) => AulaService.upsert(a),
  deleteAula: (id) => AulaService.delete(id),

  addAluno: (a) => {
    AlunoService.create(a);
  },
  updateAluno: (id, a) => {
    AlunoService.update(id, a);
  },
  deleteAluno: (id) => {
    AlunoService.delete(id);
  },

  addTurma: (t) => {
    TurmaService.create(t);
  },
  updateTurma: (id, t) => {
    TurmaService.update(id, t);
  },
  deleteTurma: (id) => {
    TurmaService.delete(id);
  },

  addProfessor: (p) => {
    ProfessorService.create(p);
  },
  updateProfessor: (id, p) => {
    ProfessorService.update(id, p);
  },
  deleteProfessor: (id) => {
    ProfessorService.delete(id);
  },

  addNivel: (n) => {
    NivelService.create(n);
  },
  updateNivel: (id, n) => {
    NivelService.update(id, n);
  },
  deleteNivel: (id) => {
    NivelService.delete(id);
  },

  addPremio: (p) => set((s) => ({ premios: [...s.premios, p] })),
  deletePremio: (id) =>
    set((s) => ({
      premios: s.premios.filter((x) => x.id !== id),
      premiacoes: s.premiacoes.filter((p) => p.premioId !== id),
    })),

  addCriterio: (c) => set((s) => ({ criterios: [...s.criterios, c] })),
  deleteCriterio: (id) => set((s) => ({ criterios: s.criterios.filter((x) => x.id !== id) })),

  addFeedback: (f) => set((s) => ({ feedbacks: [f, ...s.feedbacks] })),
  deleteFeedback: (id) => set((s) => ({ feedbacks: s.feedbacks.filter((x) => x.id !== id) })),

  addPremiacao: (p) => {
    PremiacaoService.grant(p);
  },
  deletePremiacao: (id) => {
    PremiacaoService.revoke(id);
  },

  addAvaliacao: (a) => {
    AvaliacaoService.create(a);
  },
  deleteAvaliacao: (id) => {
    AvaliacaoService.delete(id);
  },

  assignAlunoToTurma: (alunoId, turmaId) => TurmaService.assignAluno(alunoId, turmaId),

  emailExists: (email, ignoreAlunoId) => AlunoService.emailExists(email, ignoreAlunoId),
}));

// Bind store to repository bridge so services/repos can read/write state.
bindStore(
  () => useStore.getState() as unknown as Record<string, unknown>,
  (updater) => {
    if (typeof updater === 'function') {
      useStore.setState((prev) => (updater as (p: Record<string, unknown>) => Record<string, unknown>)(
        prev as unknown as Record<string, unknown>,
      ) as Partial<State>);
    } else {
      useStore.setState(updater as Partial<State>);
    }
  },
);

// ---------------------------------------------------------------------------
// Typed selectors — prefer these over destructuring the whole state.
// ---------------------------------------------------------------------------
export const selectAlunos = (s: State): Aluno[] => s.alunos;
export const selectTurmas = (s: State): Turma[] => s.turmas;
export const selectProfessores = (s: State): Professor[] => s.professores;
export const selectNiveis = (s: State): Nivel[] => s.niveis;
export const selectPremios = (s: State): Premio[] => s.premios;
export const selectAulas = (s: State): Aula[] => s.aulas;
export const selectFeedbacks = (s: State): Feedback[] => s.feedbacks;
export const selectAvaliacoes = (s: State): Avaliacao[] => s.avaliacoes;
export const selectPremiacoes = (s: State): Premiacao[] => s.premiacoes;
export const selectAlunoCreds = (s: State): AlunoCred[] => s.alunoCreds;

export const selectAlunoById = (id: string) => (s: State): Aluno | undefined =>
  s.alunos.find((a) => a.id === id);
export const selectTurmaById = (id: string) => (s: State): Turma | undefined =>
  s.turmas.find((t) => t.id === id);
export const selectProfessorById = (id: string) => (s: State): Professor | undefined =>
  s.professores.find((p) => p.id === id);
export const selectNivelById = (id: string) => (s: State): Nivel | undefined =>
  s.niveis.find((n) => n.id === id);

// Used by `s` getter — keep get() referenced to silence unused warnings.
void get;
