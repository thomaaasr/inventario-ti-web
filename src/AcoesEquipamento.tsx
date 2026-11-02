import { useState, type FormEvent } from 'react';
import { devolver, emprestar, ErroApi, type Emprestimo, type Equipamento } from './api.ts';

type Props = {
  equipamento: Equipamento;
  emprestimoAberto?: Emprestimo;
  token: string;
  aoAlterar: () => void;
  aoExpirarLogin: () => void;
};

// Botões de emprestar e devolver de uma linha da tabela.
function AcoesEquipamento({ equipamento, emprestimoAberto, token, aoAlterar, aoExpirarLogin }: Props) {
  const [emprestando, setEmprestando] = useState(false);
  const [responsavel, setResponsavel] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Executa a ação na API e trata os erros do mesmo jeito para emprestar e devolver.
  async function executar(acao: () => Promise<unknown>) {
    setErro(null);
    setEnviando(true);
    try {
      await acao();
      setEmprestando(false);
      setResponsavel('');
      aoAlterar();
    } catch (e) {
      if (e instanceof ErroApi && e.status === 401) {
        aoExpirarLogin();
        return;
      }
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  function confirmarEmprestimo(evento: FormEvent) {
    evento.preventDefault();
    executar(() => emprestar(equipamento.id, responsavel.trim(), token));
  }

  if (equipamento.status === 'emprestado' && emprestimoAberto) {
    return (
      <div className="acoes-linha">
        <button disabled={enviando} onClick={() => executar(() => devolver(emprestimoAberto.id, token))}>
          Devolver
        </button>
        {erro && <span className="erro">{erro}</span>}
      </div>
    );
  }

  if (equipamento.status !== 'disponivel') {
    return null;
  }

  if (!emprestando) {
    return (
      <button className="principal" onClick={() => setEmprestando(true)}>
        Emprestar
      </button>
    );
  }

  return (
    <form className="acoes-linha" onSubmit={confirmarEmprestimo}>
      <input
        placeholder="Responsável"
        value={responsavel}
        onChange={(e) => setResponsavel(e.target.value)}
        required
        autoFocus
      />
      <button type="submit" className="principal" disabled={enviando}>
        Confirmar
      </button>
      <button type="button" onClick={() => setEmprestando(false)}>
        Cancelar
      </button>
      {erro && <span className="erro">{erro}</span>}
    </form>
  );
}

export default AcoesEquipamento;
