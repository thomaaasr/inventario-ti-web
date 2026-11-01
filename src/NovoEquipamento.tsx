import { useState, type FormEvent } from 'react';
import { cadastrarEquipamento, ErroApi, type NovoEquipamento as Dados } from './api.ts';

type Props = {
  token: string;
  aoCadastrar: () => void;
  aoExpirarLogin: () => void;
};

const VAZIO: Dados = { tipo: '', marca: '', modelo: '', numeroSerie: '' };

function NovoEquipamento({ token, aoCadastrar, aoExpirarLogin }: Props) {
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Atualiza só o campo que mudou, mantendo os outros.
  function alterar(campo: keyof Dados, valor: string) {
    setDados({ ...dados, [campo]: valor });
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await cadastrarEquipamento(dados, token);
      setDados(VAZIO);
      aoCadastrar();
    } catch (e) {
      // 401: o token venceu (dura 1 hora) ou é inválido; é preciso entrar de novo.
      if (e instanceof ErroApi && e.status === 401) {
        aoExpirarLogin();
        return;
      }
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="cartao" onSubmit={enviar}>
      <h2>Cadastrar equipamento</h2>
      <div className="campos">
        <input placeholder="Tipo" value={dados.tipo} onChange={(e) => alterar('tipo', e.target.value)} required />
        <input placeholder="Marca" value={dados.marca} onChange={(e) => alterar('marca', e.target.value)} required />
        <input placeholder="Modelo" value={dados.modelo} onChange={(e) => alterar('modelo', e.target.value)} required />
        <input
          placeholder="Nº de série"
          value={dados.numeroSerie}
          onChange={(e) => alterar('numeroSerie', e.target.value)}
          required
        />
      </div>
      {erro && <p className="erro">{erro}</p>}
      <button type="submit" className="principal" disabled={enviando}>
        Cadastrar
      </button>
    </form>
  );
}

export default NovoEquipamento;