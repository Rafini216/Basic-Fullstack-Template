import React, { useEffect, useState } from 'react';
import { loadMoviesAPI, deleteMovieAPI, updateMovieAPI } from '../services/api';
import PosterImage from '../components/ui/PosterImage';
import MovieInfo from '../components/ui/MovieInfo';
import MovieActions from '../components/ui/MovieActions';
import EditMovie from './EditMovie';


export default function AllMovies() {
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);

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
		const prev = movies;
		const next = movies.map((it) => (it._id === m._id ? { ...it, watched: !it.watched } : it));
		setMovies(next);
		try {
			await updateMovieAPI(m._id, { watched: !m.watched });
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('movies:counts-changed'));
			}
		} catch (e) {
			setMovies(prev);
			alert(e.message || 'Failed to update');
		}
	};

	const deleteMovie = async (m) => {
		if (!confirm(`Delete ${m.title}?`)) return;
		try {
			await deleteMovieAPI(m._id);
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('movies:changed'));
			}
			fetchMovies();
		} catch (e) {
			alert(e.message || 'Failed to delete');
		}
	};

		const startEdit = (m) => setEditing(m);
		const closeEdit = () => setEditing(null);
		const saveEdit = async (updates) => {
			if (!editing) return;
			try {
				await updateMovieAPI(editing._id, updates);
				setEditing(null);
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('movies:changed'));
				}
				fetchMovies();
			} catch (e) {
				alert(e.message || 'Failed to save changes');
			}
		};



	return (
		<div className="bg-white rounded-xl p-4 shadow">
			<h2 className="font-bold mb-3">Todos os Filmes</h2>

			{loading && <div>Carregando…</div>}
			{error && <div className="text-red-700">{error}</div>}
			{!loading && !error && (
				<ul className="grid gap-3">
					{movies.map((m) => (
						<li key={m._id} className="relative group flex items-center gap-3 border border-gray-200 rounded-lg p-2.5">
							<PosterImage src={m.posterUrl} alt={m.title} className="w-10 h-[60px] object-cover rounded-md border border-gray-100" />
							<MovieInfo title={m.title} imdbID={m.imdbID} genre={m.genre} year={m.year} createdAt={m.createdAt} updatedAt={m.updatedAt} rating={m.rating} />
							{!editing && (
								<MovieActions
									movie={m}
									onToggleWatched={toggleWatched}
									onDelete={deleteMovie}
									onEdit={startEdit}
									className="absolute bottom-2 right-2 z-10"
								/>
							)}
						</li>
					))}
				</ul>
			)}
            {editing && (
              <EditMovie movie={editing} onClose={closeEdit} onSave={saveEdit} />
            )}
		</div>
	);
}

