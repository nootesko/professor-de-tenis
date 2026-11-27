import { describe, it, expect, beforeEach } from 'vitest';
import { AulaService } from '@/lib/services';
import { resetState } from '@/lib/repositories/mock/store-bridge';
import { useStore } from '@/lib/store';
import { mediaNotas, tabelaBrincaTenis, premioDoNivel, premiosEntre, proximoPremio, conquistasDoAluno } from '@/lib/gamificacao';
import type { Aluno, Aula, ProgramaRecompensas } from '@/lib/types';

const aluno = (over: Partial<Aluno> = {}): Aluno => ({
  id: 'a1',
  nome: 'Ana Teste',
  email: 'ana@example.com',
  telefone: '',
  nascimento: '2020-01-01',
  endereco: { rua: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' },
  avatar: '',
  nivelId: 'n-verde',
  pontos: 0,
  status: 'ativo',
  ...over,
});

const aula = (over: Partial<Aula> = {}): Aula => ({
  id: 'au1',
  turmaId: 't1',
  data: '2026-11-20',
  presenca: { a1: true },
  notas: {},
  observacao: {},
  ponto: {},
  nivel: {},
  finalizadaEm: '2026-11-20T12:00:00Z',
  ...over,
});

function reset(programa: Partial<ProgramaRecompensas> = {}, pontos = 0) {
  resetState({
    alunos: [aluno({ pontos })],
    turmas: [],
    professores: [],
    niveis: [],
    tabela: tabelaBrincaTenis(),
    criterios: [],
    feedbacks: [],
    aulas: [],
    lancamentos: [],
    avaliacoes: [],
    alunoCreds: [],
    programa: { nome: 'BrincaTênis', unidade: 'pontos', celebracao: 'todo-ponto', ...programa },
  });
}

const st = () => useStore.getState();

describe('mediaNotas', () => {
  it('ignora critérios em branco (não contam como zero)', () => {
    expect(mediaNotas({ esforco: 4, disciplina: 2 })).toBe(3);
  });
  it('zero é nota válida', () => {
    expect(mediaNotas({ esforco: 0, disciplina: 4 })).toBe(2);
  });
  it('sem nenhuma nota devolve null', () => {
    expect(mediaNotas({})).toBeNull();
  });
  it('considera só os critérios selecionados', () => {
    expect(mediaNotas({ a: 5, b: 1, c: 3 }, ['a', 'c'])).toBe(4);
  });
});

describe('tabela de níveis BrincaTênis (sem limite)', () => {
  const t = tabelaBrincaTenis();
  it('5 pequenas, 5 médias, 5 grandes e especial no múltiplo de 16', () => {
    expect([1, 5].map((n) => premioDoNivel(t, n)?.nome)).toEqual(['Medalha pequena', 'Medalha pequena']);
    expect(premioDoNivel(t, 6)?.nome).toBe('Medalha média');
    expect(premioDoNivel(t, 15)?.nome).toBe('Medalha grande');
    expect(premioDoNivel(t, 16)?.nome).toBe('Prêmio gigante 1');
    expect(premioDoNivel(t, 17)?.nome).toBe('Medalha pequena');
  });
  it('especiais definidos até o 176', () => {
    expect(premioDoNivel(t, 48)?.nome).toBe('Troféu de forehand');
    expect(premioDoNivel(t, 64)?.nome).toBe('Troféu de backhand');
    expect(premioDoNivel(t, 80)?.nome).toBe('Troféu de saque');
    expect(premioDoNivel(t, 96)?.nome).toBe('Gigante Suprema 1');
    expect(premioDoNivel(t, 176)?.nome).toBe('Troféu de Taças 3');
  });
  it('não termina no 176: medalhas continuam e o especial seguinte fica em branco', () => {
    expect(premioDoNivel(t, 177)?.nome).toBe('Medalha pequena');
    expect(premioDoNivel(t, 191)?.nome).toBe('Medalha grande');
    expect(premioDoNivel(t, 192)).toBeNull();
    expect(premioDoNivel(t, 10_000)).toBeNull(); // múltiplo de 16 não configurado
    expect(premioDoNivel(t, 10_001)?.nome).toBe('Medalha pequena');
  });
  it('nível configurado sobrepõe a regra; null deixa sem prêmio', () => {
    const t2 = { ...t, niveis: { ...t.niveis, 3: null, 192: { nome: 'Gigante Suprema 4', tipo: 'Gigante Suprema', animacao: 'fogos' as const, celebrar: true } } };
    expect(premioDoNivel(t2, 3)).toBeNull();
    expect(premioDoNivel(t2, 192)?.nome).toBe('Gigante Suprema 4');
  });
  it('vários pontos de uma vez reconhecem todos os níveis atravessados (46 → 49 inclui o 48)', () => {
    expect(premiosEntre(t, 46, 49).map((p) => p.nivel)).toEqual([47, 48, 49]);
    expect(premiosEntre(t, 46, 49).find((p) => p.nivel === 48)?.nome).toBe('Troféu de forehand');
  });
  it('conquistar não zera: o próximo prêmio segue a contagem', () => {
    expect(proximoPremio(t, 16)?.nivel).toBe(17);
    expect(proximoPremio(t, 191)?.nivel).toBe(193); // 192 sem prêmio é pulado
  });
});

describe('AulaService.finalizar', () => {
  beforeEach(() => reset());

  it('presença sozinha não concede ponto', () => {
    AulaService.finalizar(aula({ presenca: { a1: true }, ponto: {} }));
    expect(st().alunos[0].pontos).toBe(0);
    expect(st().lancamentos).toHaveLength(0);
  });

  it('pontos lançados geram nível, lançamento e comemoração', () => {
    const { conquistas } = AulaService.finalizar(aula({ ponto: { a1: 1 } }));
    expect(st().alunos[0].pontos).toBe(1);
    expect(st().lancamentos).toEqual([expect.objectContaining({ alunoId: 'a1', aulaId: 'au1', tipo: 'aula', anterior: null, valor: 1 })]);
    expect(conquistas).toEqual([expect.objectContaining({ alunoId: 'a1', premio: expect.objectContaining({ nivel: 1 }) })]);
  });

  it('aceita qualquer quantidade, sem teto', () => {
    AulaService.finalizar(aula({ ponto: { a1: 4 } }));
    expect(st().alunos[0].pontos).toBe(4);
  });

  it('pontos para aluno ausente não contam', () => {
    AulaService.finalizar(aula({ presenca: { a1: false }, ponto: { a1: 2 } }));
    expect(st().alunos[0].pontos).toBe(0);
  });

  it('bola muda o aluno, mas não mexe em pontos', () => {
    AulaService.finalizar(aula({ nivel: { a1: 'n-amarela' } }));
    expect(st().alunos[0].nivelId).toBe('n-amarela');
    expect(st().alunos[0].pontos).toBe(0);
  });

  it('correção guarda valor anterior e corrigido, e as conquistas se recalculam', () => {
    AulaService.finalizar(aula({ ponto: { a1: 2 } }));
    AulaService.finalizar(aula({ ponto: { a1: 1 } }));
    expect(st().alunos[0].pontos).toBe(1);
    expect(st().lancamentos.map((l) => [l.anterior, l.valor])).toEqual([[null, 2], [2, 1]]);
    expect(conquistasDoAluno(st().tabela, 'pontos', st().alunos[0], st().aulas).map((c) => c.nivel)).toEqual([1]);
  });

  it('salvar de novo a mesma aula não duplica ponto, lançamento nem comemoração', () => {
    AulaService.finalizar(aula({ ponto: { a1: 1 } }));
    const { conquistas } = AulaService.finalizar(aula({ ponto: { a1: 1 } }));
    expect(st().alunos[0].pontos).toBe(1);
    expect(st().lancamentos).toHaveLength(1);
    expect(conquistas).toHaveLength(0);
  });

  it('de 46 para 49 comemora 47 (grande), 48 (troféu de forehand) e 49', () => {
    reset({}, 46);
    const { conquistas } = AulaService.finalizar(aula({ ponto: { a1: 3 } }));
    expect(st().alunos[0].pontos).toBe(49);
    expect(conquistas.map((c) => c.premio.nome)).toEqual(['Medalha grande', 'Troféu de forehand', 'Medalha pequena']);
  });

  it('conquistas derivadas: saldo anterior sem data, aulas com data', () => {
    reset({}, 15);
    AulaService.finalizar(aula({ ponto: { a1: 1 } }));
    const c = conquistasDoAluno(st().tabela, 'pontos', st().alunos[0], st().aulas);
    expect(c).toHaveLength(16);
    expect(c[0].data).toBeUndefined();
    expect(c[15]).toMatchObject({ nivel: 16, data: '2026-11-20', aulaId: 'au1' });
  });

  it('com unidade "aulas", a presença é o que conta (sem precisar de ponto)', () => {
    reset({ unidade: 'aulas' });
    const { conquistas } = AulaService.finalizar(aula({ presenca: { a1: true }, ponto: {} }));
    expect(st().alunos[0].pontos).toBe(0);
    expect(conquistas.map((c) => c.premio.nivel)).toEqual([1]);
  });

  it('modo "contador" não gera comemoração', () => {
    reset({ celebracao: 'contador' });
    const { conquistas } = AulaService.finalizar(aula({ ponto: { a1: 1 } }));
    expect(conquistas).toHaveLength(0);
  });

  it('modo "marcos" só comemora prêmios marcados', () => {
    reset({ celebracao: 'marcos' }, 14);
    const r1 = AulaService.finalizar(aula({ ponto: { a1: 1 } })); // nível 15: medalha grande, não marcada
    expect(r1.conquistas).toHaveLength(0);
    const r2 = AulaService.finalizar(aula({ id: 'au2', ponto: { a1: 1 } })); // nível 16: especial, marcada
    expect(r2.conquistas.map((c) => c.premio.nivel)).toEqual([16]);
  });
});

describe('AlunoService ajuste de pontos', () => {
  beforeEach(() => reset({}, 10));
  it('mudar o total direto vira ajuste com valor anterior e novo', async () => {
    const { AlunoService } = await import('@/lib/services');
    AlunoService.update('a1', { pontos: 12 });
    expect(st().lancamentos).toEqual([expect.objectContaining({ tipo: 'ajuste', anterior: 10, valor: 12 })]);
  });
});
