import { useEffect, useState, type FormEvent } from "react";
import {
  listarEquipamentos,
  type PaginaEquipamentos,
  type StatusEquipamento,
} from "./api.ts";
import Login from "./Login.tsx";
import NovoEquipamento from "./NovoEquipamento.tsx";

const NOMES_STATUS = {
  disponivel: "Disponível",
  emprestado: "Emprestado",
  manutencao: "Em manutenção",
};

const ITENS_POR_PAGINA = 5;

// O token fica guardado no navegador para o login sobreviver a um F5.
function lerTokenSalvo() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function salvarToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  } catch {
    // Se o navegador bloquear o armazenamento, o login vale só enquanto a página estiver aberta.
  }
}

function App() {
  const [token, setToken] = useState<string | null>(lerTokenSalvo);
  // Muda a cada cadastro, para a lista buscar de novo e mostrar o equipamento novo.
  const [versaoLista, setVersaoLista] = useState(0);
  const [pagina, setPagina] = useState<PaginaEquipamentos | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros aplicados à busca e página atual.
  const [status, setStatus] = useState<StatusEquipamento | "">("");
  const [tipo, setTipo] = useState("");
  const [numeroPagina, setNumeroPagina] = useState(1);

  // O que está sendo digitado no campo de tipo; só vira filtro ao clicar em "Filtrar".
  const [tipoDigitado, setTipoDigitado] = useState("");

  // Busca de novo sempre que um filtro ou a página mudar.
  useEffect(() => {
    let cancelada = false;
    listarEquipamentos({
      status: status || undefined,
      tipo: tipo || undefined,
      pagina: numeroPagina,
      limite: ITENS_POR_PAGINA,
    })
      .then((resultado) => {
        if (!cancelada) {
          setPagina(resultado);
          setErro(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelada) setErro(e.message);
      });
    // Se os filtros mudarem antes da resposta chegar, ignora a resposta antiga.
    return () => {
      cancelada = true;
    };
  }, [status, tipo, numeroPagina, versaoLista]);

  function aplicarTipo(evento: FormEvent) {
    evento.preventDefault();
    setTipo(tipoDigitado.trim());
    setNumeroPagina(1);
  }
  function trocarToken(novo: string | null) {
    salvarToken(novo);
    setToken(novo);
  }

  const totalPaginas = pagina
    ? Math.max(1, Math.ceil(pagina.total / pagina.limite))
    : 1;

  return (
    <main>
      <header>
        <h1>Inventário de TI</h1>
        {token && <button onClick={() => trocarToken(null)}>Sair</button>}
      </header>

      {token ? (
        <NovoEquipamento
          token={token}
          aoCadastrar={() => setVersaoLista(versaoLista + 1)}
          aoExpirarLogin={() => trocarToken(null)}
        />
      ) : (
        <Login aoEntrar={trocarToken} />
      )}
      <form className="filtros" onSubmit={aplicarTipo}>
        <select
          value={status}
          onChange={(evento) => {
            setStatus(evento.target.value as StatusEquipamento | "");
            setNumeroPagina(1);
          }}
        >
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="emprestado">Emprestado</option>
          <option value="manutencao">Em manutenção</option>
        </select>
        <input
          placeholder="Tipo (ex.: Notebook)"
          value={tipoDigitado}
          onChange={(evento) => setTipoDigitado(evento.target.value)}
        />
        <button type="submit">Filtrar</button>
      </form>

      {erro && (
        <p className="erro">
          Não foi possível carregar os equipamentos: {erro}
        </p>
      )}
      {!erro && !pagina && <p>Carregando...</p>}

      {pagina && pagina.itens.length === 0 && (
        <p>Nenhum equipamento encontrado.</p>
      )}

      {pagina && pagina.itens.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Nº de série</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagina.itens.map((equipamento) => (
              <tr key={equipamento.id}>
                <td>{equipamento.tipo}</td>
                <td>{equipamento.marca}</td>
                <td>{equipamento.modelo}</td>
                <td>{equipamento.numeroSerie}</td>
                <td>
                  <span className={`status ${equipamento.status}`}>
                    {NOMES_STATUS[equipamento.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagina && (
        <div className="paginacao">
          <button
            disabled={numeroPagina <= 1}
            onClick={() => setNumeroPagina(numeroPagina - 1)}
          >
            Anterior
          </button>
          <span>
            Página {numeroPagina} de {totalPaginas} · {pagina.total}{" "}
            equipamento(s)
          </span>
          <button
            disabled={numeroPagina >= totalPaginas}
            onClick={() => setNumeroPagina(numeroPagina + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
