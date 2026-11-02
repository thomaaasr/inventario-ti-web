// Endereço da API. Em desenvolvimento, a API roda na porta 3000 do seu computador.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type StatusEquipamento = 'disponivel' | 'emprestado' | 'manutencao';

export type Equipamento = {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  status: StatusEquipamento;
};

export type PaginaEquipamentos = {
  itens: Equipamento[];
  total: number;
  pagina: number;
  limite: number;
};

export type FiltrosEquipamentos = {
  status?: StatusEquipamento;
  tipo?: string;
  pagina: number;
  limite: number;
};

export type NovoEquipamento = Pick<Equipamento, 'tipo' | 'marca' | 'modelo' | 'numeroSerie'>;

// Erro vindo da API, com o código HTTP e a mensagem já pronta para mostrar na tela.
export class ErroApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

// Faz a requisição e, se a API responder com erro, lança um ErroApi com a mensagem dela.
async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null);
    // A validação devolve uma lista de mensagens; os outros erros, uma mensagem só.
    const mensagem = Array.isArray(corpo?.message) ? corpo.message.join(' ') : corpo?.message;
    throw new ErroApi(resposta.status, mensagem ?? `A API respondeu com o código ${resposta.status}.`);
  }
  return resposta.json();
}

export function listarEquipamentos(filtros: FiltrosEquipamentos): Promise<PaginaEquipamentos> {
  // Monta a query string só com os filtros preenchidos, por exemplo: ?status=disponivel&pagina=2&limite=5
  const parametros = new URLSearchParams({
    pagina: String(filtros.pagina),
    limite: String(filtros.limite),
  });
  if (filtros.status) {
    parametros.set('status', filtros.status);
  }
  if (filtros.tipo) {
    parametros.set('tipo', filtros.tipo);
  }
  return requisitar(`/equipamentos?${parametros}`);
}

export function criarConta(email: string, senha: string): Promise<{ id: number; email: string }> {
  return requisitar('/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
}

export async function entrar(email: string, senha: string): Promise<string> {
  const { accessToken } = await requisitar<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return accessToken;
}

export function cadastrarEquipamento(dados: NovoEquipamento, token: string): Promise<Equipamento> {
  return requisitar('/equipamentos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
}

export type Emprestimo = {
  id: number;
  equipamento: Equipamento;
  responsavel: string;
  dataEmprestimo: string;
  dataDevolucao: string | null;
};

export function listarEmprestimos(): Promise<Emprestimo[]> {
  return requisitar('/emprestimos');
}

export function emprestar(equipamentoId: number, responsavel: string, token: string): Promise<Emprestimo> {
  return requisitar('/emprestimos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ equipamentoId, responsavel }),
  });
}

export function devolver(emprestimoId: number, token: string): Promise<Emprestimo> {
  return requisitar(`/emprestimos/${emprestimoId}/devolucao`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}
