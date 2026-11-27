import { describe, it, expect, beforeEach } from 'vitest';
import { AlunoService } from '@/lib/services';
import { resetState } from '@/lib/repositories/mock/store-bridge';
import { useStore } from '@/lib/store';
import type { Aluno, Turma, Feedback, LancamentoPonto, Avaliacao, Aula, AlunoCred } from '@/lib/types';

const baseAluno = (over: Partial<Aluno> = {}): Aluno => ({
  id: 'a-test',
  nome: 'Teste',
  email: 'teste@example.com',
  telefone: '(11) 90000-0000',
  nascimento: '2000-01-01',
  endereco: { rua: 'R', numero: '1', bairro: 'B', cidade: 'C', uf: 'SP', cep: '01000-000' },
  avatar: '',
  nivelId: 'n1',
  pontos: 0,
  status: 'ativo',
  ...over,
});

beforeEach(() => {
  const turmas: Turma[] = [
    { id: 't1', nome: 'T1', diaSemana: 'Segunda', horario: '08:00', professorId: 'p1', alunosIds: ['a1'], nivelId: 'n1' },
  ];
  const feedbacks: Feedback[] = [{ id: 'f1', alunoId: 'a1', professorId: 'p1', data: '2026-01-01', texto: 'x' }];
  const lancamentos: LancamentoPonto[] = [{ id: 'lp1', alunoId: 'a1', tipo: 'aula', aulaId: 'au1', data: '2026-01-01', anterior: null, valor: 1, registradoEm: '2026-01-01T12:00:00Z' }];
  const avaliacoes: Avaliacao[] = [{ id: 'av1', alunoId: 'a1', data: '2026-01-01', scores: {} }];
  const aulas: Aula[] = [];
  const alunoCreds: AlunoCred[] = [{ alunoId: 'a1', user: 'a1', senha: 'x' }];
  resetState({
    alunos: [baseAluno({ id: 'a1', email: 'existing@example.com' })],
    turmas,
    professores: [],
    niveis: [],
    tabela: { tamanhoBloco: 16, faixas: [], niveis: {} },
    criterios: [],
    feedbacks,
    aulas,
    lancamentos,
    avaliacoes,
    alunoCreds,
  });
});

describe('AlunoService', () => {
  it('cria aluno com email novo', () => {
    const r = AlunoService.create(baseAluno({ id: 'a2', email: 'novo@example.com' }));
    expect(r.ok).toBe(true);
  });

  it('rejeita email duplicado', () => {
    const r = AlunoService.create(baseAluno({ id: 'a2', email: 'existing@example.com' }));
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/já cadastrado/);
  });

  it('delete aluno faz cascata em turmas/lancamentos/avaliacoes/feedbacks', () => {
    AlunoService.delete('a1');
    const s = useStore.getState();
    expect(s.alunos.find((a) => a.id === 'a1')).toBeUndefined();
    expect(s.turmas[0].alunosIds).not.toContain('a1');
    expect(s.feedbacks.find((f) => f.alunoId === 'a1')).toBeUndefined();
    expect(s.lancamentos.find((l) => l.alunoId === 'a1')).toBeUndefined();
    expect(s.avaliacoes.find((a) => a.alunoId === 'a1')).toBeUndefined();
  });
});
