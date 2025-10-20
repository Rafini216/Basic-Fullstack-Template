import React, { useState } from 'react';
import { AddMovieAPI } from '../services/api';
import PosterImage from '../components/ui/PosterImage';
import TitleAutocompleteWithMeta from '../components/ui/TitleAutocompleteWithMeta';
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
		<div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow dark:shadow-none border border-transparent dark:border-gray-800">
			<h2 className="font-bold mb-3">Add Movie</h2>
			<form onSubmit={handleSubmit} className="grid gap-2">
				<FormField label="Title" className="relative">
					<TitleAutocompleteWithMeta
						value={title}
						onChange={setTitle}
						setPosterUrl={setPosterUrl}
						setYear={setDetectedYear}
						setGenre={setGenre}
						getGenreValue={() => genre}
						setDetectedGenres={setDetectedGenres}
						setImdbID={setDetectedImdbID}
						overwriteGenreIfEmptyOnly
					/>
					{error && <div className="mt-1 text-xs text-red-600">{error}</div>}
				</FormField>

				<div className="flex items-center gap-2">
					  <PosterImage src={posterUrl} alt="Poster preview" className="w-15 h-[90px] object-cover rounded-md border border-gray-200 dark:border-gray-700" />
				</div>

				<FormField label="Ano de lançamento">
								<input
						type="text"
						value={detectedYear}
						readOnly
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-100"
					/>
				</FormField>

				<FormField label="Género">
								<input
						type="text"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100"
					/>
				</FormField>

				<FormField label="Rating">
					<RatingSelect value={rating} onChange={(e) => setRating(e.target.value)} />
				</FormField>

							<button
					type="submit"
					disabled={loading}
								className="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
				>
					{loading ? 'Saving…' : 'Adicionar Filme'}
				</button>
			</form>
		</div>
	);
}

