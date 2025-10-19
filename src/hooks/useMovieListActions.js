import { updateMovieAPI, deleteMovieAPI } from '../services/api';

// listType: 'all' | 'watched' | 'unwatched' | 'rating'
export default function useMovieListActions({ movies, setMovies, listType = 'all' }) {
  const toggleWatched = async (m) => {
    const prev = movies;
    if (listType === 'watched' || listType === 'unwatched') {
      // Item moves to the other list; remove it here optimistically
      setMovies((list) => list.filter((it) => it._id !== m._id));
    } else {
      // Flip watched in place
      setMovies((list) => list.map((it) => (it._id === m._id ? { ...it, watched: !it.watched } : it)));
    }
    try {
      await updateMovieAPI(m._id, { watched: !m.watched });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('movies:counts-changed'));
      }
    } catch (e) {
      setMovies(prev);
      alert(e.message || 'Falha ao atualizar');
    }
  };

  const deleteMovie = async (m) => {
    if (!confirm(`Apagar ${m.title}?`)) return;
    const prev = movies;
    setMovies((list) => list.filter((it) => it._id !== m._id));
    try {
      await deleteMovieAPI(m._id);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('movies:changed'));
      }
    } catch (e) {
      setMovies(prev);
      alert(e.message || 'Falha ao apagar');
    }
  };

  return { toggleWatched, deleteMovie };
}
