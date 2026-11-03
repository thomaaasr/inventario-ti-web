import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App.tsx';
import type { Equipamento } from './api.ts';
import { simularApi } from './testes/api-falsa.ts';

const equipamentos: Equipamento[] = [
  { id: 1, tipo: 'Notebook', marca: 'Dell', modelo: 'Latitude 5440', numeroSerie: 'NB-1042', status: 'emprestado' },
  { id: 2, tipo: 'Monitor', marca: 'LG', modelo: '24MP400', numeroSerie: 'MN-2210', status: 'disponivel' },
];

const emprestimoDaAna = {
  id: 7,
  equipamento: equipamentos[0],
  responsavel: 'Ana Souza',
  dataEmprestimo: '2026-11-01T10:00:00.000Z',
  dataDevolucao: null,
};

function apiComEquipamentos() {
  return simularApi({
    'GET /equipamentos': { corpo: { itens: equipamentos, total: 2, pagina: 1, limite: 5 } },
    'GET /emprestimos': { corpo: [emprestimoDaAna] },
  });
}

describe('App', () => {
  it('lista os equipamentos e mostra com quem está cada empréstimo', async () => {
    apiComEquipamentos();
    render(<App />);

    expect(await screen.findByText('Latitude 5440')).toBeInTheDocument();
    expect(screen.getByText('24MP400')).toBeInTheDocument();
    expect(screen.getByText('com Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1 · 2 equipamento(s)')).toBeInTheDocument();
  });

  it('sem login, mostra o formulário de entrar e esconde as ações', async () => {
    apiComEquipamentos();
    render(<App />);

    await screen.findByText('Latitude 5440');
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Emprestar' })).not.toBeInTheDocument();
  });

  it('com token salvo, mostra o cadastro e as ações de cada linha', async () => {
    localStorage.setItem('token', 'token-de-teste');
    apiComEquipamentos();
    render(<App />);

    await screen.findByText('Latitude 5440');
    expect(screen.getByRole('heading', { name: 'Cadastrar equipamento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Devolver' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Emprestar' })).toBeInTheDocument();
  });

  it('envia o filtro de status para a API', async () => {
    const fetchFalso = apiComEquipamentos();
    render(<App />);
    await screen.findByText('Latitude 5440');

    await userEvent.setup().selectOptions(screen.getByRole('combobox'), 'emprestado');

    const urls = fetchFalso.mock.calls.map(([url]) => url);
    expect(urls.some((url) => url.includes('status=emprestado'))).toBe(true);
  });

  it('avisa quando a API está fora do ar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<App />);

    expect(await screen.findByText(/Não foi possível carregar os equipamentos/)).toBeInTheDocument();
  });
});
