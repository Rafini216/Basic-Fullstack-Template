import React, { useState } from 'react';
import { AddMovieAPI } from '../services/api';
import PosterImage from '../components/ui/PosterImage';
import TitleAutocomplete from '../components/ui/TitleAutocomplete';
import FormField from '../components/ui/FormField';
import RatingSelect from '../components/ui/RatingSelect';

export default function AddMovie() {
	const [title, setTitle] = useState('');
	const [genre, setGenre] = useState('');
	const [rating, setRating] = useState('');
	const [posterUrl, setPosterUrl] = useState('');
	const [detectedYear, setDetectedYear] = useState('');
	const [detectedGenres, setDetectedGenres] = useState('');
	const [detectedImdbID, setDetectedImdbID] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');


	const applyPosterMeta = (meta) => {
		if (!meta) return;
		if (meta.posterUrl) setPosterUrl(meta.posterUrl);
		if (meta.year) setDetectedYear(String(meta.year));
		if (Array.isArray(meta.genres)) {
			const autoGenres = meta.genres.join(', ');
			setDetectedGenres(autoGenres);
			if (!genre.trim() && autoGenres) setGenre(autoGenres);
		}
		if (meta.imdbID) setDetectedImdbID(meta.imdbID);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!title.trim()) {
			setError('Title is required.');
			return;
		}
		try {
			setLoading(true);
			const payload = {
				title: title.trim(),
				posterUrl: posterUrl || undefined,
			};
			const g = genre.trim() || detectedGenres.trim();
			if (g) payload.genre = g;
				if (detectedImdbID) payload.imdbID = detectedImdbID;
			if (rating) payload.rating = Number(rating);

			await AddMovieAPI(payload);
			setTitle('');
			setGenre('');
			setRating('');
			setDetectedImdbID('');

			// Notify other components to refresh
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('movies:changed'));
			}
		} catch (e) {
			setError(e.message || 'Falha ao adicionar filme.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-xl p-4 shadow">
			<h2 className="font-bold mb-3">Add Movie</h2>
			<form onSubmit={handleSubmit} className="grid gap-2">
				<FormField label="Title" className="relative">
					<TitleAutocomplete
						value={title}
						onChange={setTitle}
						onMeta={(meta) => {
							if (meta) {
								applyPosterMeta(meta);
								if (meta.title && meta.title !== title) setTitle(meta.title);
							}
						}}
					/>
					{error && <div className="mt-1 text-xs text-red-600">{error}</div>}
				</FormField>

				<div className="flex items-center gap-2">
					<PosterImage src={posterUrl} alt="Poster preview" className="w-15 h-[90px] object-cover rounded-md border border-gray-200" />
				</div>

				<FormField label="Ano de lançamento">
					<input
						type="text"
						value={detectedYear}
						readOnly
						className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
					/>
				</FormField>

				<FormField label="Género">
					<input
						type="text"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg"
					/>
				</FormField>

				<FormField label="Rating">
					<RatingSelect value={rating} onChange={(e) => setRating(e.target.value)} />
				</FormField>

				<button
					type="submit"
					disabled={loading}
					className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
				>
					{loading ? 'Saving…' : 'Adicionar Filme'}
				</button>
			</form>
		</div>
	);
}

