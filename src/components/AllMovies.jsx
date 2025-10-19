import React, { useEffect, useState } from 'react';
import { loadMoviesAPI, deleteMovieAPI, updateMovieAPI } from '../services/api';

export default function AllMovies() {
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchMovies = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await loadMoviesAPI({ sortBy: 'createdAt', order: 'desc' });
			setMovies(data);
		} catch (e) {
			setError(e.message || 'Failed to load movies');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMovies();
		const handler = () => fetchMovies();
		window.addEventListener('movies:changed', handler);
		return () => window.removeEventListener('movies:changed', handler);
	}, []);

	const toggleWatched = async (m) => {
		try {
			await updateMovieAPI(m._id, { watched: !m.watched });
			fetchMovies();
		} catch (e) {
			alert(e.message || 'Failed to update');
		}
	};

	const deleteMovie = async (m) => {
		if (!confirm(`Delete ${m.title}?`)) return;
		try {
			await deleteMovieAPI(m._id);
			fetchMovies();
		} catch (e) {
			alert(e.message || 'Failed to delete');
		}
	};

	const formatRelativeAdded = (value) => {
		if (!value) return '—';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '—';
		const today = new Date();
		const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		const diffDays = Math.round((startToday - startThat) / 86400000);
		if (diffDays <= 0) return 'Hoje';
		if (diffDays === 1) return 'Ontem';
		return `${diffDays} dias atrás`;
	};

	return (
		<div className="bg-white rounded-xl p-4 shadow">
			<h2 className="font-bold mb-3">Todos os Filmes</h2>
			{loading && <div>Carregando…</div>}
			{error && <div className="text-red-700">{error}</div>}
			{!loading && !error && (
				<ul className="grid gap-3">
					{movies.map((m) => (
						<li key={m._id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5">
							<img
								src={m.posterUrl || '/poster-placeholder.svg'}
								alt={m.title}
								onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/poster-placeholder.svg'; }}
								className="w-10 h-[60px] object-cover rounded-md border border-gray-100"
							/>
							<div className="flex-1">
								<div className="font-semibold">
									{m.imdbID ? (
										<a href={`https://www.imdb.com/title/${m.imdbID}`} target="_blank" rel="noopener noreferrer" className="text-gray-900 no-underline hover:underline">
											{m.title} {m.year ? `(${m.year})` : ''}
										</a>
									) : (
										<span>{m.title} {m.year ? `(${m.year})` : ''}</span>
									)}
								</div>
								<div className="text-gray-500 text-sm">{m.genre || '—'}</div>
								<div className="text-gray-400 text-xs">Adicionado {formatRelativeAdded(m.createdAt)}</div>
							</div>
							<div className="flex items-center gap-2">
								<span title="rating" className="text-sm text-gray-700 min-w-[28px] text-right">{m.rating ? `⭐ ${m.rating}` : ''}</span>
								<button
									onClick={() => toggleWatched(m)}
									title={m.watched ? 'Marcar como não visto' : 'Marcar como visto'}
									aria-label={m.watched ? 'Marcar como não visto' : 'Marcar como visto'}
									className={`w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center cursor-pointer ${m.watched ? 'bg-green-100' : 'bg-gray-100'}`}
								>
									<img src={m.watched ? '/icons/eye-open.svg' : '/icons/eye-closed.svg'} alt="Alternar visto" className="w-4 h-4" />
								</button>
								<button
									onClick={() => deleteMovie(m)}
									title="Apagar"
									aria-label="Apagar"
									className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center cursor-pointer bg-red-100"
								>
									<img src='/icons/trash.svg' alt="Apagar" className="w-4 h-4" />
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

