# 📐 Arquitetura CryptoNova

## Visão Geral

CryptoNova é uma plataforma de monitoramento e trading de criptomoedas construída com:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **State**: React Context + Hooks customizados
- **Database**: IndexedDB (com fallback para localStorage)
- **Backend**: Preparado para integração com PHP (frontend desacoplado)
- **Routing**: React Router DOM v7

## 📁 Estrutura de Pastas

```
src/
├── components/       # Componentes UI reutilizáveis
│   ├── ui.tsx       # Componentes base (Card, Icon, Sparkline, etc)
│   ├── Header.tsx   # Cabeçalho global
│   ├── Footer.tsx   # Rodapé global
│   ├── ErrorBoundary.tsx  # Captura erros de renderização
│   └── ToastContainer.tsx # Notificações toast
│
├── pages/            # Páginas da aplicação (rotas)
│   ├── Home.tsx
│   ├── CoinDetail.tsx
│   ├── Trending.tsx
│   ├── Watchlist.tsx
│   ├── Portfolio.tsx
│   └── ...
│
├── context/          # Contextos globais (React Context API)
│   ├── AuthContext.tsx      # Autenticação
│   ├── CurrencyContext.tsx  # Moeda preferida
│   ├── ThemeContext.tsx     # Tema claro/escuro
│   ├── LanguageContext.tsx  # i18n
│   └── NotificationContext.tsx # Toasts
│
├── hooks/            # Hooks customizados
│   ├── usePortfolio.ts      # Portfólio do usuário
│   ├── useWatchlist.ts      # Favoritos
│   ├── useAlerts.ts         # Alertas de preço
│   └── useRealtimePrices.ts # Preços em tempo real
│
├── services/         # Camada de serviços
│   ├── config.ts        # Configurações globais
│   ├── database.ts      # IndexedDB wrapper
│   ├── crypto.ts        # Criptografia (SHA-256)
│   ├── api.ts           # API interna (CRUD)
│   ├── http.ts          # HTTP Client centralizado
│   └── externalApi.ts   # Integração com backend PHP
│
├── data/             # Dados estáticos/mock
│   ├── cryptoData.ts
│   ├── newsData.ts
│   ├── eventsData.ts
│   └── whalesData.ts
│
├── utils/            # Utilitários
│   └── cn.ts        # Classname utility (clsx + tailwind-merge)
│
└── App.tsx           # Componente raiz
```

## 🔄 Fluxo de Dados

### 1. Renderização
```
App.tsx → ThemeProvider → LanguageProvider → CurrencyProvider → NotificationProvider → AuthProvider → Router → Page
```

### 2. Trading
```
User Action → TradePage → usePortfolio.buy() → tradeApi.buy() → database.create('transactions') → User Balance Update
```

### 3. Preços em Tempo Real
```
useRealtimePrices (hook) → setInterval (3s) → update state → UI re-render → Charts/Tables atualizados
```

### 4. Watchlist
```
useWatchlist → usePortfolio → watchlistApi.get(userId) → IndexedDB watchlist store
```

## 🎯 Padrões Utilizados

### Singleton Pattern
- `database.ts` - instância única do IndexedDB
- `http.ts` - instância única do HttpClient

### Repository Pattern
- `api.ts` - abstrai acesso ao banco
- `externalApi.ts` - abstrai chamadas HTTP externas

### Context Pattern
- Cada contexto global tem seu Provider + Hook (`useX`)

### Error Boundary
- `ErrorBoundary` captura erros de qualquer componente
- Previne tela preta em caso de crash

## 🔌 Integração com Backend PHP

### Configuração
Edite `src/services/config.ts`:
```typescript
apiBaseUrl: 'https://seu-backend.com/api'
```

### Fluxo de autenticação
1. Frontend chama `externalAuthApi.login(email, password)`
2. Backend PHP valida e retorna JWT
3. Frontend armazena token via `httpClient.setAuthToken(token)`
4. Próximas requisições incluem `Authorization: Bearer <token>`

### Endpoints esperados do PHP
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/validate
GET  /api/prices
GET  /api/prices/:id
GET  /api/prices/:id/history
POST /api/trade/buy
POST /api/trade/sell
GET  /api/trade/transactions
GET  /api/trade/holdings
GET  /api/news
POST /api/alerts
GET  /api/alerts
DELETE /api/alerts/:id
```

## 🔒 Segurança

- **Senhas**: Hash SHA-256 + salt (Web Crypto API)
- **Tokens**: 32 bytes aleatórios (crypto.getRandomValues)
- **Validação**: Server-side em todas as operações críticas
- **Rate Limiting**: Backend deve implementar
- **2FA**: Suporte preparado (UI implementada)

## 📊 Banco de Dados (IndexedDB)

### Stores
- `users` - Usuários cadastrados
- `sessions` - Sessões ativas (tokens)
- `holdings` - Posições em cripto
- `transactions` - Histórico de trades
- `watchlist` - Favoritos por usuário
- `alerts` - Alertas de preço
- `settings` - Preferências
- `logs` - Auditoria

### Índices
- `email` em users (unique)
- `userId` em holdings, transactions, alerts, logs
- `token` em sessions (unique)

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
npm run build
# Gera dist/index.html
```

### Backend PHP
- Laravel, Symfony ou Slim Framework recomendados
- MySQL ou PostgreSQL para dados persistentes
- Redis para cache de preços

## 📝 Convenções

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (`usePortfolio.ts`)
- **Contextos**: PascalCase com sufixo `Context` (`AuthContext.tsx`)
- **Serviços**: camelCase (`crypto.ts`, `api.ts`)
- **Tipos**: PascalCase (`UserRecord`, `HoldingRecord`)

## 🐛 Debug

### Ver dados do IndexedDB
```javascript
// No console do browser
await import('./src/services/database').then(m => m.db.export()).then(console.log)
```

### Limpar banco
```javascript
await import('./src/services/database').then(async m => {
  await m.db.clear('users');
  await m.db.clear('sessions');
  await m.db.clear('holdings');
  // etc
})
```

### Ativar logs
Adicione `?debug=true` na URL para logs detalhados.
