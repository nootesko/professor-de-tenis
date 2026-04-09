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

export interface AlunoRepository {
  list(): Aluno[];
  byId(id: string): Aluno | undefined;
  add(a: Aluno): void;
  update(id: string, patch: Partial<Aluno>): void;
  remove(id: string): void;
}

export interface TurmaRepository {
  list(): Turma[];
  byId(id: string): Turma | undefined;
  add(t: Turma): void;
  update(id: string, patch: Partial<Turma>): void;
  remove(id: string): void;
}

export interface ProfessorRepository {
  list(): Professor[];
  byId(id: string): Professor | undefined;
  add(p: Professor): void;
  update(id: string, patch: Partial<Professor>): void;
  remove(id: string): void;
}

export interface NivelRepository {
  list(): Nivel[];
  byId(id: string): Nivel | undefined;
  add(n: Nivel): void;
  update(id: string, patch: Partial<Nivel>): void;
  remove(id: string): void;
}

export interface AvaliacaoRepository {
  list(): Avaliacao[];
  add(a: Avaliacao): void;
  remove(id: string): void;
}

export interface PremioRepository {
  list(): Premio[];
  add(p: Premio): void;
  remove(id: string): void;
}

export interface PremiacaoRepository {
  list(): Premiacao[];
  add(p: Premiacao): void;
  remove(id: string): void;
}

export interface AulaRepository {
  list(): Aula[];
  upsert(a: Aula): void;
  remove(id: string): void;
}

export interface FeedbackRepository {
  list(): Feedback[];
  add(f: Feedback): void;
  remove(id: string): void;
}

export interface CriterioRepository {
  list(): CriterioAvaliacao[];
  add(c: CriterioAvaliacao): void;
  remove(id: string): void;
}

export interface AlunoCredRepository {
  list(): AlunoCred[];
  byAlunoId(alunoId: string): AlunoCred | undefined;
  add(c: AlunoCred): void;
  remove(alunoId: string): void;
}
