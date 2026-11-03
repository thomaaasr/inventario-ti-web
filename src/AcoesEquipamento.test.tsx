import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AcoesEquipamento from './AcoesEquipamento.tsx';
import type { Emprestimo, Equipamento } from './api.ts';
import { chamada, simularApi } from './testes/api-falsa.ts';

const notebook: Equipamento = {
  id: 1,
  tipo: 'Notebook',
  marca: 'Dell',
  modelo: 'Latitude 5440',
  numeroSerie: 'NB-1042',
  status: 'disponivel',
};

describe('AcoesEquipamento', () => {
  it('empresta o equipamento para o responsável digitado', async () => {
    const fetchFalso = simularApi({ 'POST /emprestimos': { status: 201, corpo: {} } });
    const aoAlterar = vi.fn();
    render(
      <AcoesEquipamento equipamento={notebook} token="token-de-teste" aoAlterar={aoAlterar} aoExpirarLogin={vi.fn()} />,
    );
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole('button', { name: 'Emprestar' }));
    await usuario.type(screen.getByPlaceholderText('Responsável'), 'Bruno Costa');
    await usuario.click(screen.getByRole('button', { name: 'Confirmar' }));

    const enviada = chamada(fetchFalso, 0);
    expect(enviada.corpo).toEqual({ equipamentoId: 1, responsavel: 'Bruno Costa' });
    expect(enviada.cabecalhos?.Authorization).toBe('Bearer token-de-teste');
    expect(aoAlterar).toHaveBeenCalled();
  });

  it('devolve o empréstimo aberto', async () => {
    const fetchFalso = simularApi({ 'PATCH /emprestimos/7/devolucao': { corpo: {} } });
    const emprestimo: Emprestimo = {
      id: 7,
      equipamento: notebook,
      responsavel: 'Ana Souza',
      dataEmprestimo: '2026-11-01T10:00:00.000Z',
      dataDevolucao: null,
    };
    render(
      <AcoesEquipamento
        equipamento={{ ...notebook, status: 'emprestado' }}
        emprestimoAberto={emprestimo}
        token="token-de-teste"
        aoAlterar={vi.fn()}
        aoExpirarLogin={vi.fn()}
      />,
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Devolver' }));

    expect(chamada(fetchFalso, 0).metodo).toBe('PATCH');
  });

  it('pede login de novo quando o token expirou (401)', async () => {
    simularApi({ 'POST /emprestimos': { status: 401, corpo: { message: 'Token inválido ou expirado.' } } });
    const aoExpirarLogin = vi.fn();
    render(
      <AcoesEquipamento
        equipamento={notebook}
        token="token-velho"
        aoAlterar={vi.fn()}
        aoExpirarLogin={aoExpirarLogin}
      />,
    );
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole('button', { name: 'Emprestar' }));
    await usuario.type(screen.getByPlaceholderText('Responsável'), 'Bruno Costa');
    await usuario.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(aoExpirarLogin).toHaveBeenCalled();
  });
});
