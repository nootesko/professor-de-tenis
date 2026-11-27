'use client';
import { create } from 'zustand';
import {
  alunos as alunosSeed,
  turmas as turmasSeed,
  professores as profsSeed,
  niveis as niveisSeed,
  tabela as tabelaSeed,
  criterios as critSeed,
  feedbacks as fbSeed,
  aulas as aulasSeed,
  lancamentos as lancSeed,
  avaliacoes as avalSeed,
  alunoCreds as credsSeed,
  programa as programaSeed,
} from './mock-data';
import type {
  Aluno,
  Turma,
  Professor,
  Nivel,
  CriterioAvaliacao,
  Feedback,
  Aula,
  LancamentoPonto,
  Avaliacao,
  AlunoCred,
  ProgramaRecompensas,
  TabelaNiveis,
  PremioNivel,
} from './types';
import type { Conquista } from './gamificacao';
import { bindStore } from './repositories/mock/store-bridge';
import {
  AlunoService,
  TurmaService,
  ProfessorService,
  NivelService,
  AvaliacaoService,
  TabelaNiveisService,
  AulaService,
} from './services';

type State = {
  alunos: Aluno[];
  turmas: Turma[];
  professores: Professor[];
  niveis: Nivel[];
  tabela: TabelaNiveis;
  criterios: CriterioAvaliacao[];
  feedbacks: Feedback[];
  aulas: Aula[];
  lancamentos: LancamentoPonto[];
  avaliacoes: Avaliacao[];
  alunoCreds: AlunoCred[];
  programa: ProgramaRecompensas;

  setPrograma: (p: Partial<ProgramaRecompensas>) => void;

  upsertAula: (a: Aula) => void;
  finalizarAula: (a: Aula) => { conquistas: Conquista[] };
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

  definirNivelPremio: (nivel: number, premio: PremioNivel | null) => void;
  usarRegraNoNivel: (nivel: number) => void;
  definirFaixa: (indice: number, premio: PremioNivel) => void;

  addCriterio: (c: CriterioAvaliacao) => void;
  updateCriterio: (id: string, c: Partial<CriterioAvaliacao>) => void;
  deleteCriterio: (id: string) => void;

  addFeedback: (f: Feedback) => void;
  deleteFeedback: (id: string) => void;

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
  tabela: tabelaSeed,
  criterios: critSeed,
  feedbacks: fbSeed,
  aulas: aulasSeed,
  lancamentos: lancSeed,
  avaliacoes: avalSeed,
  alunoCreds: credsSeed,
  programa: programaSeed,

  setPrograma: (p) => set((s) => ({ programa: { ...s.programa, ...p } })),

  upsertAula: (a) => AulaService.upsert(a),
  finalizarAula: (a) => AulaService.finalizar(a),
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

  definirNivelPremio: (nivel, premio) => {
    TabelaNiveisService.definirNivel(nivel, premio);
  },
  usarRegraNoNivel: (nivel) => {
    TabelaNiveisService.usarRegra(nivel);
  },
  definirFaixa: (indice, premio) => {
    TabelaNiveisService.definirFaixa(indice, premio);
  },

  addCriterio: (c) => set((s) => ({ criterios: [...s.criterios, c] })),
  updateCriterio: (id, c) => set((s) => ({ criterios: s.criterios.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
  deleteCriterio: (id) => set((s) => ({ criterios: s.criterios.filter((x) => x.id !== id) })),

  addFeedback: (f) => set((s) => ({ feedbacks: [f, ...s.feedbacks] })),
  deleteFeedback: (id) => set((s) => ({ feedbacks: s.feedbacks.filter((x) => x.id !== id) })),

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
export const selectTabela = (s: State): TabelaNiveis => s.tabela;
export const selectAulas = (s: State): Aula[] => s.aulas;
export const selectFeedbacks = (s: State): Feedback[] => s.feedbacks;
export const selectAvaliacoes = (s: State): Avaliacao[] => s.avaliacoes;
export const selectLancamentos = (s: State): LancamentoPonto[] => s.lancamentos;
export const selectPrograma = (s: State): ProgramaRecompensas => s.programa;
export const selectCriterios = (s: State): CriterioAvaliacao[] => s.criterios;
export const selectAlunoCreds = (s: State): AlunoCred[] => s.alunoCreds;

export const selectAlunoById = (id: string) => (s: State): Aluno | undefined =>
  s.alunos.find((a) => a.id === id);
export const selectTurmaById = (id: string) => (s: State): Turma | undefined =>
  s.turmas.find((t) => t.id === id);
export const selectProfessorById = (id: string) => (s: State): Professor | undefined =>
  s.professores.find((p) => p.id === id);
export const selectNivelById = (id: string) => (s: State): Nivel | undefined =>
  s.niveis.find((n) => n.id === id);

