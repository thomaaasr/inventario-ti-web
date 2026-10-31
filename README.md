# Inventário de TI — Web

Interface web do [Inventário de TI](https://github.com/thomaaasr/inventario-ti-api): mostra os
equipamentos de TI da empresa e o status de cada um, consumindo a API REST do projeto.
Construída com **React** e **TypeScript**.

## Funcionalidades

- [x] Lista de equipamentos com o status de cada um
- [x] Filtros por status e tipo, e paginação
- [ ] Login e cadastro de equipamentos
- [ ] Empréstimos e devoluções
- [ ] Publicação online

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 24 ou superior e a
[API](https://github.com/thomaaasr/inventario-ti-api) rodando em `http://localhost:3000`.

```bash
npm install
npm run dev
```

A interface abre em `http://localhost:5173`.

## Tecnologias

`React` `TypeScript` `Vite`