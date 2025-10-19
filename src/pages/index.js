import React, { useEffect, useState } from 'react';
import AddMovie from '../components/AddMovie';
import AllMovies from '../components/AllMovies';
import WatchedMovies from '../components/WatchedMovies';
import NotWatchedMovies from '../components/NotWatchedMovies';
import MoviesByRating from '../components/MoviesByRating';
import { loadMoviesAPI } from '../services/api';

export default function Home() {
  const [tab, setTab] = useState('all'); // 'all' | 'watched' | 'unwatched' | 'rating'
  const [counts, setCounts] = useState({ all: 0, watched: 0, unwatched: 0 });

  useEffect(() => {
    const refreshCounts = async () => {
      try {
        const [all, watched, unwatched] = await Promise.all([
          loadMoviesAPI({}),
          loadMoviesAPI({ watched: true }),
          loadMoviesAPI({ watched: false })
        ]);
        setCounts({ all: all.length, watched: watched.length, unwatched: unwatched.length });
      } catch (e) {
        // keep previous counts on error
      }
    };

    refreshCounts();
    const handler = () => refreshCounts();
    window.addEventListener('movies:changed', handler);
    window.addEventListener('movies:counts-changed', handler);
    return () => {
      window.removeEventListener('movies:changed', handler);
      window.removeEventListener('movies:counts-changed', handler);
    };
  }, []);
  return (
    <div className="bg-gray-100 min-h-screen p-5 flex items-center justify-center">
      <div className="w-[390px] max-w-full mx-auto flex flex-col gap-5">
        <AddMovie />
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-md border text-sm ${tab==='all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setTab('all')}
          >
            Todos ({counts.all})
          </button>
          <button
            className={`px-3 py-1 rounded-md border text-sm ${tab==='watched' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setTab('watched')}
          >
            Vistos ({counts.watched})
          </button>
          <button
            className={`px-3 py-1 rounded-md border text-sm ${tab==='unwatched' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setTab('unwatched')}
          >
            Não vistos ({counts.unwatched})
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-md border text-sm ${tab==='rating' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setTab('rating')}
          >
            Por Avaliação
          </button>
        </div>
        {tab === 'all' && <AllMovies />}
        {tab === 'watched' && <WatchedMovies />}
        {tab === 'unwatched' && <NotWatchedMovies />}
        {tab === 'rating' && <MoviesByRating />}
      </div>
    </div>
  );
}
