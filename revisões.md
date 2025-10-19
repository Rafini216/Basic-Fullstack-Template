# Revisão Teórica — Projeto Fullstack (Next.js + Express.js + MongoDB)

## Fluxo de Criação Passo a Passo

> Ordem ideal para criar uma aplicação fullstack completa com Next.js, Express.js e MongoDB

1. **Instalar o projeto e dependências**
   ```bash
   npx create-next-app@latest ...
   npm install express cors next mongodb mongoose dotenv
   npm install -D nodemon
   ```
   Cria a base do projeto e instala ferramentas necessárias (frontend + backend).

2. **Configurar o `.env`**
   ```env
   MONGODB_URI=mongodb+srv://...
   PORT=3000
   NODE_ENV=development
   ```
   Define variáveis de ambiente (segurança e flexibilidade).

3. **Criar ligação à base de dados (`lib/mongodb.js`)**
   - Este ficheiro é sempre igual e não muda entre projetos.
   - Usa Mongoose para ligar ao MongoDB Atlas.

4. **Criar os modelos/coleções da base de dados (`models/`)**
   - Cada ficheiro define uma *coleção* e a sua estrutura.
   - Exemplo: `models/Nome.js`

5. **Definir os endpoints no servidor (`server.js`)**
   - Este ficheiro tem primeiro umas variáveis que nunca alteram, depois os endpoints e no fim a iniciação do servidor.
   - Cria as rotas da API (GET, POST, PUT, DELETE).
   - Liga Express, Next.js e MongoDB.
   - Exemplo:
     ```js
     app.get('/api/nomes', async (req, res) => {...})
     ```

6. **Criar funções que chamam a API (`src/services/api.js`)**
   - Implementa uma função com `fetch()` para cada um dos endpoints definidos no servidor.
   - Separa a lógica de comunicação do resto da app.
   - Exemplo:
     ```js
     export async function carregarNomesAPI() { await fetch('/api/nomes')... }
     ```

7. **Criar páginas e componentes (`src/pages` e `src/components`)**
   - As páginas ou componentes no frontend importam as funções definidas no `api.js`.
   - Exemplo: `VerNomes.jsx` chama `carregarNomesAPI()` e `AdicionarNomes.jsx` chama `adicionarNomeAPI()`.

---

## Conceitos-Chave do Projeto

| Conceito | Descrição |
|-----------|------------|
| **Next.js** | Framework React para o frontend (renderização e rotas) |
| **Express.js** | Servidor backend e API |
| **MongoDB + Mongoose** | Base de dados NoSQL + interface simplificada |
| **dotenv** | Gestão de variáveis de ambiente |
| **fetch** | Função JavaScript para chamadas HTTP (endpoints) |
| **useState / useEffect** | Hooks React para estado e efeitos secundários |

---

## Estrutura Final do Projeto

```
next-express-project/
│
├── lib/
│   └── mongodb.js              # Conexão com a base de dados
├── models/
│   └── Nome.js                 # Modelo Mongoose
├── src/
│   ├── pages/
│   │   └── index.js            # Página principal
│   ├── components/
│   │   ├── VerNomes.jsx        # Componente para ver nomes
│   │   └── AdicionarNomes.jsx  # Componente para adicionar nomes
│   └── services/
│       └── api.js              # Funções com endpoints para comunicação com o servidor
├── .env                        # Variáveis de ambiente
├── server.js                   # Integra Express + Next + MongoDB e define endpoints
└── package.json
```

---

## Ordem Resumida de Desenvolvimento

1️⃣ Instalar projeto e dependências  
2️⃣ Configurar `.env`  
3️⃣ Criar `lib/mongodb.js`  
4️⃣ Criar `models/` (coleções da base de dados)  
5️⃣ Definir endpoints no `server.js`  
6️⃣ Implementar funções com os endpoints em `src/services/api.js`  
7️⃣ Criar páginas e componentes React (frontend)

