import { vi } from 'vitest';

type Rota = { status?: number; corpo: unknown };

// Troca o fetch do navegador por uma versão falsa: cada rota responde o que o teste definir,
// sem precisar da API rodando. A chave é "MÉTODO /caminho", por exemplo "POST /auth/login".
export function simularApi(rotas: Record<string, Rota>) {
  const fetchFalso = vi.fn(async (url: string, opcoes: RequestInit = {}) => {
    const { pathname } = new URL(url);
    const chave = `${opcoes.method ?? 'GET'} ${pathname}`;
    const rota = rotas[chave];
    if (!rota) {
      throw new Error(`Rota não simulada no teste: ${chave}`);
    }
    return new Response(JSON.stringify(rota.corpo), { status: rota.status ?? 200 });
  });
  vi.stubGlobal('fetch', fetchFalso);
  return fetchFalso;
}

// Corpo (JSON) e cabeçalhos da chamada número `indice` feita ao fetch falso.
export function chamada(fetchFalso: ReturnType<typeof simularApi>, indice: number) {
  const [url, opcoes = {}] = fetchFalso.mock.calls[indice];
  return {
    url,
    metodo: opcoes.method ?? 'GET',
    corpo: opcoes.body ? JSON.parse(String(opcoes.body)) : undefined,
    cabecalhos: opcoes.headers as Record<string, string> | undefined,
  };
}
