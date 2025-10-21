// TMDb helper utilities to centralize search and enrichment logic
// Uses global fetch (Node 18+)

function getApiKeyLanguage() {
  const apiKey = process.env.TMDB_API_KEY;
  const language = process.env.TMDB_LANGUAGE || 'en-US';
  return { apiKey, language };
}



function buildPosterUrl(path, size = 'w500') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined;
}
//aceita ano para depois atualizar em search movies
async function tmdbSearch(query, { year, limit } = {}) {
  const { apiKey, language } = getApiKeyLanguage();
  if (!apiKey) return [];
  const q = String(query || '').trim();
  if (!q) return [];

  const params = new URLSearchParams({
    api_key: apiKey,
    query: q,
    include_adult: 'false',
    language,
  });
  if (year) params.set('year', String(year));

  const resp = await fetch(`https://api.themoviedb.org/3/search/movie?${params.toString()}`);
  if (!resp.ok) return [];
  const data = await resp.json();
  let results = Array.isArray(data.results) ? data.results : [];
  if (typeof limit === 'number') results = results.slice(0, Math.max(0, limit));
  return results;
}



async function getMovieGenre(id, language) {
  const { apiKey } = getApiKeyLanguage();
  if (!apiKey || !id) return {};
  try {
    const params = new URLSearchParams({ api_key: apiKey, language: language || getApiKeyLanguage().language });
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?${params.toString()}`);
    if (!resp.ok) return {};
    const details = await resp.json();
    const genres = Array.isArray(details.genres) ? details.genres.map((g) => g.name).filter(Boolean) : undefined;
    return { genres };
  } catch {
    return {};
  }
}
//imdbID para link externo
async function getExternalIds(id) {
  const { apiKey } = getApiKeyLanguage();
  if (!apiKey || !id) return {};
  try {
    const params = new URLSearchParams({ api_key: apiKey });
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}/external_ids?${params.toString()}`);
    if (!resp.ok) return {};
    const data = await resp.json();
    return { imdbID: data?.imdb_id || undefined };
  } catch {
    return {};
  }
}

// typeahead
async function searchMovies(query, { year, limit } = {}) {
  const results = await tmdbSearch(query, { year, limit });
  return results.map((r) => ({
    id: r.id,
    title: r.title,
    originalTitle: r.original_title,
    year: r.release_date ? Number(r.release_date.slice(0, 4)) : undefined,
    posterUrl: buildPosterUrl(r.poster_path, 'w185'),
  }));
}

// Movie metadata info
async function enrichByTitle(title, year) {
  const { apiKey, language } = getApiKeyLanguage();
  if (!apiKey || !title) return null;
  const safeTitle = String(title).trim();
  const results = await tmdbSearch(safeTitle, { year });
  if (!results || results.length === 0) return null;
candidate = results.find((item) => item.poster_path) || results[0];
  if (!candidate) return null;

  const posterUrl = buildPosterUrl(candidate.poster_path, 'w500');
  const resolvedYear = candidate.release_date ? Number(candidate.release_date.slice(0, 4)) : undefined;
  const resolvedTitle = candidate.title;
  const originalTitle = candidate.original_title;

  const [details, external] = await Promise.all([
    getMovieGenre(candidate.id, language),
    getExternalIds(candidate.id),
  ]);

  return {
    posterUrl,
    imdbID: external.imdbID,
    year: resolvedYear,
    genres: details.genres,
    title: resolvedTitle,
    originalTitle,
  };
}

module.exports = {
  searchMovies,
  enrichByTitle,
};


