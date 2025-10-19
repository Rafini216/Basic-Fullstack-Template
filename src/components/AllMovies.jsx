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

	return (
		<div style={{ background: '#ffffff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
			<h2 style={{ fontWeight: 700, marginBottom: 12 }}>All Movies</h2>
			{loading && <div>Loading…</div>}
			{error && <div style={{ color: '#b91c1c' }}>{error}</div>}
			{!loading && !error && (
				<ul style={{ display: 'grid', gap: 12 }}>
					{movies.map((m) => (
						<li key={m._id} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #eee', borderRadius: 10, padding: 10 }}>
							<img
								src={m.posterUrl || '/poster-placeholder.svg'}
								alt={m.title}
								onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/poster-placeholder.svg'; }}
								style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #f3f4f6' }}
							/>
							<div style={{ flex: 1 }}>
								<div style={{ fontWeight: 600 }}>{m.title} {m.year ? `(${m.year})` : ''}</div>
								<div style={{ color: '#6b7280', fontSize: 14 }}>{m.genre || '—'}</div>
							</div>
							<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
								<span title="rating" style={{ fontSize: 12, color: '#374151' }}>{m.rating ? `⭐ ${m.rating}` : ''}</span>
								<button onClick={() => toggleWatched(m)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: m.watched ? '#dcfce7' : '#f3f4f6' }}>
									{m.watched ? 'Watched' : 'Mark watched'}
								</button>
								<button onClick={() => deleteMovie(m)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fee2e2', color: '#991b1b' }}>
									Delete
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

