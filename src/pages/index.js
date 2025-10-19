import React, { useEffect, useState } from 'react';
import AddMovie from '../components/AddMovie';
import AllMovies from '../components/AllMovies';
import WatchedMovies from '../components/WatchedMovies';
import NotWatchedMovies from '../components/NotWatchedMovies';
import MoviesByRating from '../components/MoviesByRating';
import { loadMoviesAPI } from '../services/api';
import FilterSelect from '../components/ui/FilterSelect';

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
        <div className="flex flex-col gap-1">
          <label htmlFor="filterSelect" className="text-sm text-gray-700">Filtrar por:</label>
          <FilterSelect
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            counts={counts}
            className=""
            id="filterSelect"
          />
        </div>
        {tab === 'all' && <AllMovies />}
        {tab === 'watched' && <WatchedMovies />}
        {tab === 'unwatched' && <NotWatchedMovies />}
        {tab === 'rating' && <MoviesByRating />}
      </div>
    </div>
  );
}
