import type {
  Aluno,
  Turma,
  Professor,
  Nivel,
  Avaliacao,
  Premio,
  Premiacao,
  Aula,
  Feedback,
  CriterioAvaliacao,
  AlunoCred,
} from '@/lib/types';
import type {
  AlunoRepository,
  TurmaRepository,
  ProfessorRepository,
  NivelRepository,
  AvaliacaoRepository,
  PremioRepository,
  PremiacaoRepository,
  AulaRepository,
  FeedbackRepository,
  CriterioRepository,
  AlunoCredRepository,
} from '../types';
import { getState, setState } from './store-bridge';

type S = {
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
};

const s = (): S => getState<S>();

export const mockAlunoRepository: AlunoRepository = {
  list: () => s().alunos,
  byId: (id) => s().alunos.find((a) => a.id === id),
  add: (a) => setState((prev) => ({ ...prev, alunos: [...(prev as S).alunos, a] })),
  update: (id, patch) =>
    setState((prev) => ({
      ...prev,
      alunos: (prev as S).alunos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),
  remove: (id) => setState((prev) => ({ ...prev, alunos: (prev as S).alunos.filter((a) => a.id !== id) })),
};

export const mockTurmaRepository: TurmaRepository = {
  list: () => s().turmas,
  byId: (id) => s().turmas.find((t) => t.id === id),
  add: (t) => setState((prev) => ({ ...prev, turmas: [...(prev as S).turmas, t] })),
  update: (id, patch) =>
    setState((prev) => ({
      ...prev,
      turmas: (prev as S).turmas.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  remove: (id) => setState((prev) => ({ ...prev, turmas: (prev as S).turmas.filter((t) => t.id !== id) })),
};

export const mockProfessorRepository: ProfessorRepository = {
  list: () => s().professores,
  byId: (id) => s().professores.find((p) => p.id === id),
  add: (p) => setState((prev) => ({ ...prev, professores: [...(prev as S).professores, p] })),
  update: (id, patch) =>
    setState((prev) => ({
      ...prev,
      professores: (prev as S).professores.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  remove: (id) =>
    setState((prev) => ({ ...prev, professores: (prev as S).professores.filter((p) => p.id !== id) })),
};

export const mockNivelRepository: NivelRepository = {
  list: () => s().niveis,
  byId: (id) => s().niveis.find((n) => n.id === id),
  add: (n) => setState((prev) => ({ ...prev, niveis: [...(prev as S).niveis, n] })),
  update: (id, patch) =>
    setState((prev) => ({
      ...prev,
      niveis: (prev as S).niveis.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),
  remove: (id) => setState((prev) => ({ ...prev, niveis: (prev as S).niveis.filter((n) => n.id !== id) })),
};

export const mockAvaliacaoRepository: AvaliacaoRepository = {
  list: () => s().avaliacoes,
  add: (a) => setState((prev) => ({ ...prev, avaliacoes: [a, ...(prev as S).avaliacoes] })),
  remove: (id) =>
    setState((prev) => ({ ...prev, avaliacoes: (prev as S).avaliacoes.filter((a) => a.id !== id) })),
};

export const mockPremioRepository: PremioRepository = {
  list: () => s().premios,
  add: (p) => setState((prev) => ({ ...prev, premios: [...(prev as S).premios, p] })),
  remove: (id) => setState((prev) => ({ ...prev, premios: (prev as S).premios.filter((p) => p.id !== id) })),
};

export const mockPremiacaoRepository: PremiacaoRepository = {
  list: () => s().premiacoes,
  add: (p) => setState((prev) => ({ ...prev, premiacoes: [p, ...(prev as S).premiacoes] })),
  remove: (id) =>
    setState((prev) => ({ ...prev, premiacoes: (prev as S).premiacoes.filter((p) => p.id !== id) })),
};

export const mockAulaRepository: AulaRepository = {
  list: () => s().aulas,
  upsert: (a) =>
    setState((prev) => {
      const aulas = (prev as S).aulas;
      const exists = aulas.some((x) => x.id === a.id);
      return { ...prev, aulas: exists ? aulas.map((x) => (x.id === a.id ? a : x)) : [a, ...aulas] };
    }),
  remove: (id) => setState((prev) => ({ ...prev, aulas: (prev as S).aulas.filter((a) => a.id !== id) })),
};

export const mockFeedbackRepository: FeedbackRepository = {
  list: () => s().feedbacks,
  add: (f) => setState((prev) => ({ ...prev, feedbacks: [f, ...(prev as S).feedbacks] })),
  remove: (id) =>
    setState((prev) => ({ ...prev, feedbacks: (prev as S).feedbacks.filter((f) => f.id !== id) })),
};

export const mockCriterioRepository: CriterioRepository = {
  list: () => s().criterios,
  add: (c) => setState((prev) => ({ ...prev, criterios: [...(prev as S).criterios, c] })),
  remove: (id) =>
    setState((prev) => ({ ...prev, criterios: (prev as S).criterios.filter((c) => c.id !== id) })),
};

export const mockAlunoCredRepository: AlunoCredRepository = {
  list: () => s().alunoCreds,
  byAlunoId: (alunoId) => s().alunoCreds.find((c) => c.alunoId === alunoId),
  add: (c) => setState((prev) => ({ ...prev, alunoCreds: [...(prev as S).alunoCreds, c] })),
  remove: (alunoId) =>
    setState((prev) => ({
      ...prev,
      alunoCreds: (prev as S).alunoCreds.filter((c) => c.alunoId !== alunoId),
    })),
};
