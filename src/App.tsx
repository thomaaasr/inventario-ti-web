import { useEffect, useState, type FormEvent } from 'react';
import { listarEquipamentos, type PaginaEquipamentos, type StatusEquipamento } from './api.ts';

const NOMES_STATUS = {
  disponivel: 'Disponível',
  emprestado: 'Emprestado',
  manutencao: 'Em manutenção',
};

const ITENS_POR_PAGINA = 5;

function App() {
  const [pagina, setPagina] = useState<PaginaEquipamentos | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros aplicados à busca e página atual.
  const [status, setStatus] = useState<StatusEquipamento | ''>('');
  const [tipo, setTipo] = useState('');
  const [numeroPagina, setNumeroPagina] = useState(1);

  // O que está sendo digitado no campo de tipo; só vira filtro ao clicar em "Filtrar".
  const [tipoDigitado, setTipoDigitado] = useState('');

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
  }, [status, tipo, numeroPagina]);

  function aplicarTipo(evento: FormEvent) {
    evento.preventDefault();
    setTipo(tipoDigitado.trim());
    setNumeroPagina(1);
  }

  const totalPaginas = pagina ? Math.max(1, Math.ceil(pagina.total / pagina.limite)) : 1;

  return (
    <main>
      <h1>Inventário de TI</h1>

      <form className="filtros" onSubmit={aplicarTipo}>
        <select
          value={status}
          onChange={(evento) => {
            setStatus(evento.target.value as StatusEquipamento | '');
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

      {erro && <p className="erro">Não foi possível carregar os equipamentos: {erro}</p>}
      {!erro && !pagina && <p>Carregando...</p>}

      {pagina && pagina.itens.length === 0 && <p>Nenhum equipamento encontrado.</p>}

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
                  <span className={`status ${equipamento.status}`}>{NOMES_STATUS[equipamento.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagina && (
        <div className="paginacao">
          <button disabled={numeroPagina <= 1} onClick={() => setNumeroPagina(numeroPagina - 1)}>
            Anterior
          </button>
          <span>
            Página {numeroPagina} de {totalPaginas} · {pagina.total} equipamento(s)
          </span>
          <button disabled={numeroPagina >= totalPaginas} onClick={() => setNumeroPagina(numeroPagina + 1)}>
            Próxima
          </button>
        </div>
      )}
    </main>
  );
}

export default App;