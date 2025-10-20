// GET /api/filmes - Carrega filmes
export async function loadMoviesAPI(options = {}) {
  try {
    const { watched, sortBy, order } = options;
    const params = new URLSearchParams();
    if (watched !== undefined) params.set('watched', String(Boolean(watched)));
    if (sortBy) params.set('sortBy', String(sortBy));
    if (order) params.set('order', String(order));

    const url = params.toString() ? `/api/filmes?${params.toString()}` : '/api/filmes';
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Erro na resposta:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Erro ao carregar filmes');
    }
    
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erro ao carregar filmes:', error);
    throw error;
  }
}

// Small helper to append optional params cleanly
function setParamIfPresent(params, key, value) {
  if (value != null && `${value}` !== '') {
    params.set(key, String(value));
  }
}

// POST /api/filmes - Adiciona novo filme
export async function AddMovieAPI(filme) {
  try {
    const response = await fetch('/api/filmes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filme)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.erro || 'Erro ao adicionar filme')
    }
    
    const resultado = await response.json()
    return resultado

  } catch (error) {
    console.error('Erro ao adicionar filme:', error)
    throw error
  }
}

// PUT /api/filmes/:id - Atualiza um filme
export async function updateMovieAPI(id, updates) {
  try {
    const response = await fetch(`/api/filmes/${encodeURIComponent(id)}` ,{
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Erro ao atualizar filme');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar filme:', error);
    throw error;
  }
}

// DELETE /api/filmes/:id - Remove um filme
export async function deleteMovieAPI(id) {
  try {
    const response = await fetch(`/api/filmes/${encodeURIComponent(id)}`, { method: 'DELETE' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Erro ao eliminar filme');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao eliminar filme:', error);
    throw error;
  }
}

// GET /api/filmes/lookupPoster?title=&year=
export async function lookupPosterAPI(title, year) {
  try {
    const params = new URLSearchParams();
    if (title) params.set('title', String(title));
    setParamIfPresent(params, 'year', year);
    const url = `/api/filmes/lookupPoster?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Poster não encontrado');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao procurar poster:', error);
    throw error;
  }
}

// GET /api/filmes/search?q=&year=&limit=
export async function searchMoviesAPI(query, limit = 20, year) {
  try {
    const q = String(query || '').trim();
    if (q.length < 2) return [];
    const params = new URLSearchParams();
    params.set('q', q);
    setParamIfPresent(params, 'year', year);
    if (limit) params.set('limit', String(limit));
    const url = `/api/filmes/search?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Erro ao pesquisar filmes:', error);
    return [];
  }
}
