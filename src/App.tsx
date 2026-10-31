import { useEffect, useState } from 'react';
import { listarEquipamentos, type PaginaEquipamentos } from './api.ts';

const NOMES_STATUS = {
  disponivel: 'Disponível',
  emprestado: 'Emprestado',
  manutencao: 'Em manutenção',
};

function App() {
  const [pagina, setPagina] = useState<PaginaEquipamentos | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Busca os equipamentos uma vez, quando a tela abre.
  useEffect(() => {
    listarEquipamentos()
      .then(setPagina)
      .catch((e: Error) => setErro(e.message));
  }, []);

  return (
    <main>
      <h1>Inventário de TI</h1>

      {erro && <p className="erro">Não foi possível carregar os equipamentos: {erro}</p>}
      {!erro && !pagina && <p>Carregando...</p>}

      {pagina && pagina.itens.length === 0 && <p>Nenhum equipamento cadastrado.</p>}

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

      {pagina && <p className="total">Total: {pagina.total} equipamento(s)</p>}
    </main>
  );
}

export default App;