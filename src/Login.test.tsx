import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Login from './Login.tsx';
import { chamada, simularApi } from './testes/api-falsa.ts';

// Preenche o formulário como uma pessoa faria: clicando e digitando.
async function preencher(email: string, senha: string) {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByPlaceholderText('E-mail'), email);
  await usuario.type(screen.getByPlaceholderText(/Senha/), senha);
  return usuario;
}

describe('Login', () => {
  it('entra e entrega o token recebido da API', async () => {
    const fetchFalso = simularApi({ 'POST /auth/login': { corpo: { accessToken: 'token-de-teste' } } });
    const aoEntrar = vi.fn();
    render(<Login aoEntrar={aoEntrar} />);

    const usuario = await preencher('ana@exemplo.com', 'senha-forte-123');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(aoEntrar).toHaveBeenCalledWith('token-de-teste');
    expect(chamada(fetchFalso, 0).corpo).toEqual({ email: 'ana@exemplo.com', senha: 'senha-forte-123' });
  });

  it('mostra a mensagem de erro da API quando a senha está errada', async () => {
    simularApi({ 'POST /auth/login': { status: 401, corpo: { message: 'E-mail ou senha inválidos.' } } });
    const aoEntrar = vi.fn();
    render(<Login aoEntrar={aoEntrar} />);

    const usuario = await preencher('ana@exemplo.com', 'senha-errada');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument();
    expect(aoEntrar).not.toHaveBeenCalled();
  });

  it('ao criar conta, registra o usuário e já entra em seguida', async () => {
    const fetchFalso = simularApi({
      'POST /auth/registro': { status: 201, corpo: { id: 1, email: 'ana@exemplo.com' } },
      'POST /auth/login': { corpo: { accessToken: 'token-novo' } },
    });
    const aoEntrar = vi.fn();
    render(<Login aoEntrar={aoEntrar} />);

    const usuario = await preencher('ana@exemplo.com', 'senha-forte-123');
    await usuario.click(screen.getByRole('button', { name: 'Não tem conta? Criar conta' }));
    await usuario.click(screen.getByRole('button', { name: 'Criar conta e entrar' }));

    expect(chamada(fetchFalso, 0).url).toContain('/auth/registro');
    expect(chamada(fetchFalso, 1).url).toContain('/auth/login');
    expect(aoEntrar).toHaveBeenCalledWith('token-novo');
  });
});
