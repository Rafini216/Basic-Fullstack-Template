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
const { searchMovies, enrichByTitle } = require('./lib/tmdb');// obter poster e metadados via TMDb
// Modelos Mongoose (adiciona mais se necessário)
const Movie = require('./models/Filme');



// ===== ENDPOINTS DA API =====




async function fetchPoster(title, year) {
  return process.env.TMDB_API_KEY ? enrichByTitle(title, year) : null;
}

// GET /api/filmes - Carrega todos os filmes, com filtros e ordenação
app.get('/api/filmes', async (req, res) => {
  try {
    const { watched, sortBy, order } = req.query;


    const query = {};
    if (watched === 'true' || watched === 'false') {
      query.watched = watched === 'true';
    }

    const key = sortBy || 'title';
    const dir = order === 'desc' ? -1 : 1;

    const filmes = await Movie.find(query).sort({ [key]: dir }).lean();
    res.json(filmes);
  } catch (error) {
    console.error('Erro ao carregar filmes:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /api/filmes/lookupPoster?title=&year=

app.get('/api/filmes/lookupPoster', async (req, res) => {
  try {
    const { title, year } = req.query || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ erro: 'título é obrigatório' });
    }
    const result = await fetchPoster(String(title).trim(), year ? Number(year) : undefined);
    if (!result) return res.status(404).json({ erro: 'Poster não encontrado' });
    res.json(result);
  } catch (error) {
    console.error('Erro ao procurar poster:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /api/filmes/search?q=&year=&limit=
// Lightweight TMDb search to power the typeahead in the client
app.get('/api/filmes/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const year = req.query.year ? Number(req.query.year) : undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 20);
    if (!q || q.length < 2) return res.json([]);

    const results = await searchMovies(q, { year, limit });
    res.json(results);
  } catch (e) {
    console.error('Erro na pesquisa TMDb:', e);
    res.json([]);
  }
});

// POST /api/filmes - Adiciona um novo filme
app.post('/api/filmes', async (req, res) => {
  try {
    const { title, genre, watched, rating, posterUrl, imdbID } = req.body || {};


    if (!title || !String(title).trim()) {
      return res.status(400).json({ erro: 'Título é obrigatório' });
    }

    let posterMeta = {};
    try {
      posterMeta = (await fetchPoster(String(title).trim(), undefined)) || {};
    } catch { }

    const novoFilme = new Movie({
      title: String(title).trim(),
      year: posterMeta.year || undefined,
      genre: (genre && String(genre).trim()) || (Array.isArray(posterMeta.genres) ? posterMeta.genres.join(', ') : undefined),
      watched: Boolean(watched),
      rating: rating === undefined || rating === null ? undefined : Number(rating),
      posterUrl: posterUrl || posterMeta.posterUrl,
      imdbID: imdbID || posterMeta.imdbID,
    });

    const filmeSalvo = await novoFilme.save();
    res.status(201).json(filmeSalvo);
  } catch (error) {
    console.error('Erro ao criar filme:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});



// PUT /api/filmes/:id - Atualiza um filme existente
app.put('/api/filmes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, genre, watched, rating, posterUrl, imdbID, year } = req.body || {};

    const updates = {};
    if (title !== undefined) {
      if (!String(title).trim()) return res.status(400).json({ erro: 'Título não pode ser vazio' });
      updates.title = String(title).trim();
    }

    if (genre !== undefined) {
      if (!String(genre).trim()) return res.status(400).json({ erro: 'Género não pode ser vazio' });
      updates.genre = String(genre).trim();
    }
    if (watched !== undefined) {
      updates.watched = Boolean(watched);
    }
    if (rating !== undefined) {
      const r = Number(rating);
      updates.rating = Number.isNaN(r) ? undefined : r;
    }

    if (posterUrl !== undefined) updates.posterUrl = posterUrl || undefined;
    if (imdbID !== undefined) updates.imdbID = imdbID || undefined;
    if (year !== undefined) {
      const y = Number(year);
      updates.year = Number.isNaN(y) ? undefined : y;
    }


    if (updates.title && posterUrl === undefined && imdbID === undefined && year === undefined) {
      try {
        const meta = await fetchPoster(updates.title, undefined);
        if (meta) {
          if (meta.posterUrl) updates.posterUrl = meta.posterUrl;
          if (Array.isArray(meta.genres)) updates.genre = (updates.genre || genre || '').trim() || meta.genres.join(', ');
          if (meta.imdbID) updates.imdbID = meta.imdbID;
          if (meta.year) updates.year = meta.year;
        }
      } catch { }
    }

    updates.updatedAt = new Date();

    const updated = await Movie.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ erro: 'Filme não encontrado' });
    res.json(updated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    console.error('Erro ao atualizar filme:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// DELETE /api/filmes/:id - Eliminar um filme
app.delete('/api/filmes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Movie.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ erro: 'Filme não encontrado' });
    res.json({ mensagem: 'Filme eliminado com sucesso' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    console.error('Erro ao eliminar filme:', error);
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
