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

// Modelos Mongoose (adiciona mais se necessário)
const Movie = require('./models/Filme');



// ===== ENDPOINTS DA API =====

// obter poster via TMDb 
async function fetchPosterFromTMDb(title, year) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey || !title) return null;

    const safeTitle = String(title).trim();
    const language = process.env.TMDB_LANGUAGE || 'en-US';

    const searchParams = new URLSearchParams({
      api_key: apiKey,
      query: safeTitle,
      include_adult: 'false',
      language,
    });
    if (year) searchParams.set('year', String(year));

    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data || !Array.isArray(data.results) || data.results.length === 0) return null;

    const normalize = (t) => String(t || '').trim().toLowerCase().replace(/^(the|a|an)\s+/i, '');
    const wanted = normalize(safeTitle);

    let candidate = data.results.find(item => normalize(item.title) === wanted && item.poster_path);
    if (!candidate && year) {
      const y = Number(year);
      candidate = data.results.find(item => Number(item.release_date?.slice(0,4)) === y && item.poster_path);
    }
    if (!candidate) {
      candidate = data.results.find(item => item.poster_path) || data.results[0];
    }
    if (!candidate) return null;

  const posterUrl = candidate.poster_path ? `https://image.tmdb.org/t/p/w500${candidate.poster_path}` : undefined;
    const resolvedYear = candidate.release_date ? Number(candidate.release_date.slice(0,4)) : undefined;
  const resolvedTitle = candidate.title;
  const originalTitle = candidate.original_title;

    // géneros do filme
    let genres;
    try {
      const detailsParams = new URLSearchParams({ api_key: apiKey, language });
      const detailsResp = await fetch(`https://api.themoviedb.org/3/movie/${candidate.id}?${detailsParams.toString()}`);
      if (detailsResp.ok) {
        const details = await detailsResp.json();
        if (Array.isArray(details.genres)) {
          genres = details.genres.map(g => g.name).filter(Boolean);
        }
      }
    } catch {}

    // imdbID para link do IMDb
    let imdbID;
    try {
      const extParams = new URLSearchParams({ api_key: apiKey });
      const extResp = await fetch(`https://api.themoviedb.org/3/movie/${candidate.id}/external_ids?${extParams.toString()}`);
      if (extResp.ok) {
        const extData = await extResp.json();
        if (extData && extData.imdb_id) imdbID = extData.imdb_id;
      }
    } catch {}

  return { posterUrl, imdbID, year: resolvedYear, genres, title: resolvedTitle, originalTitle };
  } catch {
    return null;
  }
}


async function fetchPoster(title, year) {
  return process.env.TMDB_API_KEY ? fetchPosterFromTMDb(title, year) : null;
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
      return res.status(400).json({ erro: 'Parâmetro "title" é obrigatório' });
    }
  const result = await fetchPoster(String(title).trim(), year ? Number(year) : undefined);
    if (!result) return res.status(404).json({ erro: 'Poster não encontrado' });
    res.json(result);
  } catch (error) {
    console.error('Erro no lookup de poster:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /api/filmes/search?q=&year=&limit=
// Lightweight TMDb search to power the typeahead in the client
app.get('/api/filmes/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const year = req.query.year ? Number(req.query.year) : undefined;
    const limit = Math.min(Number(req.query.limit) || 8, 20);
    if (!q || q.length < 2) return res.json([]);

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.json([]);
    const language = process.env.TMDB_LANGUAGE || 'en-US';

    const params = new URLSearchParams({
      api_key: apiKey,
      query: q,
      include_adult: 'false',
      language,
    });
    if (year) params.set('year', String(year));

    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?${params.toString()}`);
    if (!resp.ok) return res.json([]);
    const data = await resp.json();

    const results = Array.isArray(data.results) ? data.results.slice(0, limit).map(r => ({
      id: r.id,
      title: r.title,
      originalTitle: r.original_title,
      year: r.release_date ? Number(r.release_date.slice(0, 4)) : undefined,
      posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w185${r.poster_path}` : undefined,
    })) : [];

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
    } catch {}

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

    // If title changed and no posterUrl/year/imdbID provided, enrich via TMDb
    if (updates.title && posterUrl === undefined && imdbID === undefined && year === undefined) {
      try {
        const meta = await fetchPoster(updates.title, undefined);
        if (meta) {
          if (meta.posterUrl) updates.posterUrl = meta.posterUrl;
          if (Array.isArray(meta.genres)) updates.genre = (updates.genre || genre || '').trim() || meta.genres.join(', ');
          if (meta.imdbID) updates.imdbID = meta.imdbID;
          if (meta.year) updates.year = meta.year;
        }
      } catch {}
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
