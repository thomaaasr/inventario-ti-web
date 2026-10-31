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

export async function listarEquipamentos(): Promise<PaginaEquipamentos> {
  const resposta = await fetch(`${API_URL}/equipamentos`);
  if (!resposta.ok) {
    throw new Error(`A API respondeu com o código ${resposta.status}.`);
  }
  return resposta.json();
}