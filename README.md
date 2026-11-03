# Inventário de TI — Web

[![CI](https://github.com/thomaaasr/inventario-ti-web/actions/workflows/ci.yml/badge.svg)](https://github.com/thomaaasr/inventario-ti-web/actions/workflows/ci.yml)

Interface web do [Inventário de TI](https://github.com/thomaaasr/inventario-ti-api): mostra os
equipamentos de TI da empresa e o status de cada um, consumindo a API REST do projeto.
Construída com **React** e **TypeScript**.

## Demonstração online

Acesse: **[inventario-ti-web-s2mz.onrender.com](https://inventario-ti-web-s2mz.onrender.com)**

> A API fica no plano gratuito do Render: depois de 15 minutos sem uso ela "dorme", e o primeiro
> acesso pode levar cerca de 1 minuto. Os dados são de demonstração. Para cadastrar e emprestar,
> crie uma conta na própria tela.

## Funcionalidades

- [x] Lista de equipamentos com o status de cada um
- [x] Filtros por status e tipo, e paginação
- [x] Login e cadastro de equipamentos
- [x] Empréstimos e devoluções
- [x] Publicação online
- [x] Testes automatizados (Vitest e Testing Library)

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) 24 ou superior e a
[API](https://github.com/thomaaasr/inventario-ti-api) rodando em `http://localhost:3000`.

```bash
npm install
npm run dev
```

A interface abre em `http://localhost:5173`.

Para apontar para outra API, defina a variável `VITE_API_URL` (por exemplo, num arquivo `.env.local`).

## Testes

Os testes simulam a API (não precisam dela rodando) e usam a tela como uma pessoa faria:

```bash
npm test
```

## Tecnologias

`React` `TypeScript` `Vite` `Vitest` `Testing Library` `Prettier` `GitHub Actions` `Render`
