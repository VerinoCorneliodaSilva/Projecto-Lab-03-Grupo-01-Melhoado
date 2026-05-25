# CryptoNova

CryptoNova é uma plataforma de monitoramento e trading de criptomoedas com frontend em React/Vite e backend PHP com autenticação JWT. O fluxo atual foi ajustado para persistir **saldo**, **holdings**, **transações** e **snapshots de portfólio** no banco MySQL, permitindo que a página de portfólio reflita o estado real após compras e vendas.

## ✨ O que o projeto faz

- Cadastro e login com JWT
- Visualização de criptomoedas e dados de mercado
- Compra e venda de ativos com validação de saldo e persistência do histórico
- Dashboard de portfólio com:
  - saldo disponível
  - valor investido
  - valor atual
  - lucro/prejuízo
  - gráfico de performance
  - histórico de transações
  - eventos/snapshots do portfólio
- Rotas protegidas para áreas autenticadas

## 🧱 Arquitetura atual

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS
- React Router
- Recharts para gráficos
- Contexts para autenticação, tema, idioma, moeda e notificações

### Backend
- PHP 8+
- API central em `backend/index.php`
- Autenticação JWT em `backend/utils/jwt.php`
- Controllers para autenticação e trading
- Model `User` responsável por carteira, holdings e transações

### Persistência
- MySQL/MariaDB
- Tabelas principais em `backend/cryptonova.sql`
  - `users`
  - `user_wallets`
  - `user_holdings`
  - `trade_transactions`
  - `portfolio_snapshots`

> O frontend deixou de depender de `X-User-Id` para operações de trading. O backend agora identifica o usuário pelo JWT e atualiza o estado persistido em banco.

## 📁 Estrutura principal

```text
backend/
  index.php
  cryptonova.sql
  config/database.php
  controllers/AuthController.php
  controllers/TradeController.php
  middleware/AuthMiddleware.php
  models/User.php
  routes/auth.php
  routes/trade.php
  utils/jwt.php
  utils/response.php
  utils/validator.php

src/
  App.tsx
  main.tsx
  context/AuthContext.tsx
  hooks/usePortfolio.ts
  pages/PortfolioPage.tsx
  pages/TradePage.tsx
  services/authApi.ts
  services/api.ts
  services/http.ts
  services/config.ts
```

## 🔐 Fluxo de autenticação

1. O usuário faz login ou cadastro via `authApi`.
2. O backend valida as credenciais e retorna um `token` JWT.
3. O frontend salva o token em `sessionStorage` via `httpClient`.
4. O `AuthProvider` valida o token no reload da página com `/auth/validate`.
5. Rotas protegidas usam `ProtectedRoute` e apenas rendem o conteúdo quando há sessão válida.

## 💱 Fluxo de trading e portfólio

### Compra
1. O usuário abre a página de trading.
2. O frontend envia `POST /trade/buy` com `cryptoId`, `symbol`, `amount` e `price`.
3. O backend:
   - autentica o JWT
   - valida o saldo disponível
   - debita a carteira
   - atualiza ou cria o holding
   - registra a transação
   - cria um snapshot de portfólio
4. O frontend chama `refresh()` e `refreshUser()` para atualizar o portfólio e o saldo exibido.

### Venda
1. O frontend envia `POST /trade/sell`.
2. O backend valida a quantidade disponível, credita a carteira e registra a venda.
3. O frontend refresca holdings, transações, snapshots e saldo.

### Portfólio
A página `PortfolioPage` usa os dados reais retornados por:
- `GET /trade/holdings`
- `GET /trade/transactions`
- `GET /trade/snapshots`

Também calcula o valor atual usando o preço corrente da criptomoeda em `useRealtimePrices`.

> O preço em tempo real usado na UI é simulado pelo hook `useRealtimePrices`, mas o **histórico real de operações e snapshots vem do backend**.

## 🗄️ Banco de dados

1. Crie o banco MySQL/MariaDB.
2. Importe `backend/cryptonova.sql`.
3. Ajuste a conexão em `backend/config/database.php` se necessário.

Exemplo de configuração esperada:

```php
$host = 'localhost';
$dbname = 'cryptonova';
$username = 'root';
$password = '';
```

## 🛠️ Como rodar localmente

### Pré-requisitos
- Node.js 18+
- npm 9+
- PHP 8.1+
- Apache/XAMPP ou outro servidor PHP com MySQL

### 1) Instalar dependências

```bash
npm install
```

### 2) Configurar backend

- Suba o Apache/XAMPP.
- Garanta que o projeto está acessível em algo como:

```text
http://localhost/TIC-Projetos/Lab-03-01-Melhorado/backend/api/
```

- O valor padrão em `src/services/config.ts` já aponta para esse endereço.

Se quiser alterar a base URL, edite `VITE_API_BASE_URL` no `.env` ou o valor em `src/services/config.ts`.

### 3) Rodar o frontend

```bash
npm run dev
```

Acesse a aplicação em `http://localhost:5173`.

### 4) Build de produção

```bash
npm run build
```

## 🧪 Endpoints principais

### Autenticação
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/validate`
- `POST /auth/logout`

### Trading
- `POST /trade/buy`
- `POST /trade/sell`
- `GET /trade/holdings`
- `GET /trade/transactions`
- `GET /trade/snapshots`

## 🧭 Páginas principais

- `/` — home e listagem de ativos
- `/auth` — login/cadastro
- `/portfolio` — dashboard do portfólio
- `/trade/:id` — negociação por ativo
- `/watchlist` — favoritos
- `/settings` — preferências
- `/news` — notícias
- `/alerts` — alertas
- `/compare` — comparação de ativos

## 🐞 Resolução de problemas

### Erro de usuário não encontrado ao comprar
- Verifique se o token JWT existe no `sessionStorage`.
- Confirme que `/auth/validate` retorna o usuário corretamente.
- Verifique se o backend está acessível e se o endpoint `/trade/buy` está sendo chamado com `Authorization: Bearer <token>`.

### Portfólio não atualiza após compra/venda
- O `usePortfolio` já chama `refresh()` e `refreshUser()` após `buy()` e `sell()`.
- Garanta que o backend esteja respondendo `200` em `/trade/holdings`, `/trade/transactions` e `/trade/snapshots`.
- Se necessário, recarregue a página após a operação.

## 📌 Observações importantes

- O backend é a **fonte de verdade** para operações financeiras e persistência.
- O frontend usa o backend para saldo, holdings, transações e snapshots.
- O hook `useRealtimePrices` continua atualizando a interface, mas a persistência de portfólio fica no PHP.

## ✅ Estado atual

Este repositório já está com:
- autenticação JWT funcional
- persistência de carteira e holdings
- histórico de transações
- snapshots do portfólio
- portfólio renderizando dados reais após compra/venda
- build validado com `npm run build`
