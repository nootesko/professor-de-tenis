import { describe, it, expect, beforeEach } from 'vitest';
import { TurmaService } from '@/lib/services';
import { resetState } from '@/lib/repositories/mock/store-bridge';
import { useStore } from '@/lib/store';
import type { Aluno, Turma } from '@/lib/types';

const aluno = (id: string, turmaId?: string): Aluno => ({
  id,
  nome: id,
  email: `${id}@x.com`,
  telefone: '',
  nascimento: '',
  endereco: { rua: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' },
  avatar: '',
  nivelId: 'n1',
  pontos: 0,
  status: 'ativo',
  turmaId,
});

beforeEach(() => {
  const turmas: Turma[] = [
    { id: 't1', nome: 'T1', diaSemana: 'Seg', horario: '08:00', professorId: 'p1', alunosIds: ['a1', 'a2'], nivelId: 'n1', vagas: 2 },
    { id: 't2', nome: 'T2', diaSemana: 'Ter', horario: '09:00', professorId: 'p1', alunosIds: [], nivelId: 'n1' },
  ];
  resetState({
    alunos: [aluno('a1', 't1'), aluno('a2', 't1'), aluno('a3')],
    turmas,
    professores: [],
    niveis: [],
    premios: [],
    criterios: [],
    feedbacks: [],
    aulas: [],
    premiacoes: [],
    avaliacoes: [],
    alunoCreds: [],
  });
});

describe('TurmaService.assignAluno', () => {
  it('respeita capacidade — 3o aluno em turma com vagas=2 retorna sem vagas', () => {
    const r = TurmaService.assignAluno('a3', 't1');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/sem vagas/i);
  });

  it('move aluno entre turmas e atualiza turmaId', () => {
    const r = TurmaService.assignAluno('a1', 't2');
    expect(r.ok).toBe(true);
    const s = useStore.getState();
    const a1 = s.alunos.find((a) => a.id === 'a1');
    expect(a1?.turmaId).toBe('t2');
    expect(s.turmas.find((t) => t.id === 't1')?.alunosIds).not.toContain('a1');
    expect(s.turmas.find((t) => t.id === 't2')?.alunosIds).toContain('a1');
  });
});
