# 🚀 Ver e Adicionar Nomes App

Uma aplicação fullstack para ver e adicionar nomes desenvolvida com Next.js, Express e MongoDB.

## Tecnologias Utilizadas

- **Frontend**: Next.js + React + TailwindCSS
- **Backend**: Express.js + Node.js  
- **Base de Dados**: MongoDB + Mongoose
- **Dev Tools**: Nodemon, ESLint

## Funcionalidades

### Interface Única com 2 Componentes:
1. **VerNomes.jsx** - Visualizar os nomes existentes na base de dados.
2. **AdicionarNomes.jsx** - Adicionar um nome novo à base de dados.

### API REST com 2 Endpoints:
- `GET /api/nomes`
- `POST /api/nomes`

### Base de Dados MongoDB:
- **nomes** → `{ nome: String }`

## Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Criar ficheiro `.env` na raiz:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NODE_ENV=development
PORT=3000
```

### 3. Executar Aplicação
```bash
npm run dev
```

### 4. Aceder à Aplicação
- **Interface**: http://localhost:3000
- **API Nomes**: http://localhost:3000/api/nomes

## Estrutura do Projeto

```
├── lib/
│   └── mongodb.js              # Conexão MongoDB
├── models/
│   ├── Nome.js                 # Schema Nomes
├── src/
│   ├── components/
│   │   ├── AdicionarNomes.jsx
│   │   ├── VerNomes.jsx
│   ├── pages/
│   │   ├── index.js           # Página principal
│   │   ├── _app.js
│   │   └── _document.js
│   ├── services/
│   │   └── api.js             # Funções API
│   └── styles/
│       └── globals.css
├── server.js                  # Servidor Express
├── package.json
└── README.md
```


## Desenvolvido por Maria Beatriz Carneiro
**Desafio Básico** - Ver e adicionar nomes com Next.js, Express e MongoDB.
