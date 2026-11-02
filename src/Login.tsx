import { useState, type FormEvent } from 'react';
import { criarConta, entrar } from './api.ts';

type Props = {
  aoEntrar: (token: string) => void;
};

function Login({ aoEntrar }: Props) {
  const [criandoConta, setCriandoConta] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      // Quem está criando conta já entra em seguida.
      if (criandoConta) {
        await criarConta(email, senha);
      }
      aoEntrar(await entrar(email, senha));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="cartao" onSubmit={enviar}>
      <h2>{criandoConta ? 'Criar conta' : 'Entrar'}</h2>
      <p className="dica">Faça login para cadastrar equipamentos. A consulta é livre.</p>
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input
        type="password"
        placeholder="Senha (mínimo de 8 caracteres)"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />
      {erro && <p className="erro">{erro}</p>}
      <div className="acoes">
        <button type="submit" className="principal" disabled={enviando}>
          {criandoConta ? 'Criar conta e entrar' : 'Entrar'}
        </button>
        <button type="button" className="link" onClick={() => setCriandoConta(!criandoConta)}>
          {criandoConta ? 'Já tenho conta' : 'Não tem conta? Criar conta'}
        </button>
      </div>
    </form>
  );
}

export default Login;
