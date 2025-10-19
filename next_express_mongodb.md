# Projeto Básico com Next.js + Express.js + MongoDB

Abre o terminal na pasta onde queres adicionar o projeto (nunca numa cloud: Google Drive, OneDrive, ...):

```bash
npx create-next-app@latest next-express-project --tailwind --no-app --eslint --src-dir --import-alias "@/*"
```

Depois:

* ✔ Would you like to use TypeScript? … No
* ✔ Would you like to use Turbopack? (recommended) … No

---

## Instalar dependências

Depois de criares a app, executa:

```bash
cd next-express-project
npm install express cors next mongodb mongoose dotenv
npm install -D nodemon
```

O express é o servidor web, o cors permite chamadas API entre domínios (Next.js + Express), o mongoose é para ser mais fácil a ligação com o MongoDB, o dotenv permite usar variáveis de ambiente (.env) e o nodemon reinicia o servidor automaticamente quando alteras ficheiros.

## Configuração do ambiente (.env)

Cria o ficheiro `.env` na **raiz do projeto** com as seguintes variáveis:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NODE_ENV=development
PORT=3000
```

> **Nota**: Substitui `username`, `password`, `cluster` e `database` pelos valores do teu MongoDB Atlas.

No ficheiro `package.json`, **substitui** os scripts pelos seguintes para integrar Next.js com Express:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "server": "nodemon server.js"
  }
}
```

Agora **só precisas de um terminal** para correr tudo:

```bash
npm run dev
```

---

## Configuração MongoDB

### Conexão MongoDB (`lib/mongodb.js`)

Cria a pasta `lib` e o ficheiro `lib/mongodb.js`:

```javascript
// Este é default e não deve ser mexido
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor define a variável MONGODB_URI no ficheiro .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Conectado ao MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
```

### Modelo Mongoose (`models/Nome.js`)

Cria a pasta `models` e o ficheiro `models/Nome.js`.
Este é o modelo para a coleção "nomes", se quiseres outras coleções na tua base de dados deves criar mais ficheiros nesta pasta com o respetivo modelo.

```javascript
const mongoose = require('mongoose');

const nomeSchema = new mongoose.Schema({
  nome: { type: String, required: true }
}, {
  versionKey: false
});

module.exports = mongoose.models.Nome || mongoose.model('Nome', nomeSchema);
```

---

## Servidor Express + Next.js integrados (`server.js`)

Cria o ficheiro `server.js` na **raiz do projeto** que integra Express com Next.js.
Neste ficheiro começa um um monte de constantes que não se deve mexer! (apenas uma)
Depois tens os endpoints da API (GET, POST, PUT, DELETE).
E no fim a inicialização do servidor.

```javascript
// ===== CONSTANTES FIXAS =====
const express = require('express');
const next = require('next');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./lib/mongodb');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();
app.use(cors());
app.use(express.json());

// Esta constante é relativa às coleções da tua base de dados e deves acrescentar mais se for o caso
const Nome = require('./models/Nome');



// ===== ENDPOINTS DA API =====

// GET /api/nomes - Retorna todos os nomes existentes
app.get('/api/nomes', async (req, res) => {
  try {
    const nomes = await Nome.find().sort({ nome: 1 });
    res.json(nomes);
  } catch (error) {
    console.error('Erro ao carregar nomes:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /api/nomes - Adiciona um novo nome à coleção "nomes"
app.post('/api/nomes', async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }

    const novoNome = new Nome({ nome: nome.trim() });
    const nomeSalvo = await novoNome.save();
    res.status(201).json(nomeSalvo);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ erro: 'Este nome já existe' });
    }
    console.error('Erro ao criar nome:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});



// ===== INICIALIZAÇÃO DO SERVIDOR (também não se deve mexer)=====

app.use((req, res) => {
  return handle(req, res);
});

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  try {
    await connectDB();
    await nextApp.prepare();
    app.listen(PORT, () => {
      console.log(`Servidor Next.js + Express a correr em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
```

---

## Serviço API (`src/services/api.js`)

Neste ficheiro tens as funções que fazem as chamadas à API a partir dos endpoints que definiste no `server.js`.

```javascript
// GET /api/nomes - Carregar todos os nomes
export async function carregarNomesAPI() {
  try {
    const response = await fetch('/api/nomes')
    
    if (!response.ok) {
      console.error('Erro na resposta:', response.status, response.statusText)
      throw new Error('Erro ao carregar nomes')
    }
    
    const data = await response.json()
    return data

  } catch (error) {
    console.error('Erro ao carregar nomes:', error)
    throw error
  }
}

// POST /api/nomes - Adicionar novo nome
export async function adicionarNomeAPI(nome) {
  try {
    const response = await fetch('/api/nomes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.erro || 'Erro ao adicionar nome')
    }
    
    const resultado = await response.json()
    return resultado

  } catch (error) {
    console.error('Erro ao adicionar nome:', error)
    throw error
  }
}
```

--- 

## 🎨 3️⃣ Página inicial (`src/pages/index.js`)

No index.js só chamei dois componentes: VerNomes e AdicionarNomes.

```javascript
import AdicionarNomes from '../components/AdicionarNomes';
import VerNomes from '../components/VerNomes';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
        <VerNomes />
        <AdicionarNomes />
      </div>
    </div>
  );
}
```

---

## 🧩 4️⃣ Componentes de Layout, cria a pasta (`src/components`) e acrescenta os seguintes ficheiros:


### VerNomes.jsx
Este componente importa o GET do api.js e mostra os nomes existentes na base de dados.

```javascript
import { useState, useEffect } from 'react';
import { carregarNomesAPI } from '../services/api';

export default function VerNomes() {
  const [nomes, setNomes] = useState([]);

  async function carregarNomes() {
    try {
      const data = await carregarNomesAPI();
      setNomes(data);
    } catch (error) {
      console.error('Erro ao carregar nomes:', error);
    }
  }

  useEffect(() => {
    carregarNomes();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-72 h-fit">
      <h2 className="text-lg font-semibold mb-3">Nomes</h2>

      <div>
        {nomes.map((item) => (
          <div key={item._id}>
            {item.nome}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### AdicionarNomes.jsx

Este componente importa o POST do api.js e permite adicionar novos nomes à base de dados.

```javascript
import { useState } from 'react';
import { adicionarNomeAPI } from '../services/api';

export default function AdicionarNomes() {
  const [novoNome, setNovoNome] = useState('');

  async function adicionarNome(e) {
    e.preventDefault();
    if (!novoNome) return;
    try {
      await adicionarNomeAPI(novoNome);
      setNovoNome('');
    } catch (error) {
      console.error('Erro ao adicionar nome:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-72 h-fit">
      <h2 className="text-lg font-semibold mb-3">Adicionar Nomes</h2>
      
      <form onSubmit={adicionarNome} className="flex gap-1 mb-3">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome"
          className="flex-1 border border-gray-300 ps-3 py-2 rounded"
        />
        <button type="submit" disabled={!novoNome} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Adicionar
        </button>
      </form>
    </div>
  );
}
```

---

## Ficheiros de configuração opcionais

### `nodemon.json` (opcional - melhora performance)

Se quiseres otimizar o `nodemon` para não reiniciar desnecessariamente:

```json
{
  "watch": ["server.js", "src/"],
  "ignore": [
    "node_modules/",
    ".next/",
    "public/",
    "*.log",
    "db.json"
  ],
  "ext": "js,jsx",
  "delay": 2000
}
```

> **Nota**: Este ficheiro é **opcional**. O `nodemon` funciona sem ele, mas com configuração é mais eficiente.

---

## Configuração do MongoDB Atlas

1. **Criar conta** no [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Criar cluster** (template gratuito)
3. **Configurar acesso**:
   - Adicionar IP atual à lista de acesso
   - Criar utilizador de base de dados e copiar palavra-pass
4. **Copiar string de conexão** e colar no `.env` com a palavra-pass copiada antes.

---

## Como executar o projeto

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento** (um só comando):
   ```bash
   npm run dev
   ```

3. **Aceder à aplicação**:
   - **Frontend Next.js**: `http://localhost:3000`
   - **API REST**: `http://localhost:3000/api/nomes`

