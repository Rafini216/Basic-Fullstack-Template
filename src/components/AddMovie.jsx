import React, { useState } from 'react';
import { AddMovieAPI, lookupPosterAPI } from '../services/api';

export default function AddMovie() {
	const [title, setTitle] = useState('');
	const [genre, setGenre] = useState('');
	const [watched, setWatched] = useState(false);
	const [rating, setRating] = useState('');
	const [posterUrl, setPosterUrl] = useState('');
	const [detectedYear, setDetectedYear] = useState('');
	const [detectedGenres, setDetectedGenres] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const resetMessages = () => {
		setError('');
		setSuccess('');
	};

	const handleFetchPoster = async () => {
		resetMessages();
		if (!title.trim()) {
			setError('Please enter a title first.');
			return;
		}
		try {
			setLoading(true);
							const meta = await lookupPosterAPI(title.trim());
					if (meta.posterUrl) setPosterUrl(meta.posterUrl);
					if (meta.year) setDetectedYear(String(meta.year));
					if (Array.isArray(meta.genres)) {
						const autoGenres = meta.genres.join(', ');
						setDetectedGenres(autoGenres);
						// If the user hasn't typed a genre yet, autofill the input
						if (!genre.trim() && autoGenres) setGenre(autoGenres);
					}
							if (meta.title && meta.title !== title) {
								setTitle(meta.title);
							}
			setSuccess('Poster and metadata fetched.');
		} catch (e) {
			setError(e.message || 'Could not find poster.');
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		resetMessages();
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
			if (rating) payload.rating = Number(rating);

			await AddMovieAPI(payload);
			setSuccess('Movie added.');
			// Clear form (keep poster preview/metadata for convenience)
			setTitle('');
			setGenre('');
			setWatched(false);
			setRating('');

			// Notify other components to refresh
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('movies:changed'));
			}
		} catch (e) {
			setError(e.message || 'Failed to add movie.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ background: '#ffffff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
			<h2 style={{ fontWeight: 700, marginBottom: 12 }}>Add Movie</h2>
			<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
				<label>
					<div>Title</div>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g., The Purge"
						style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
					/>
				</label>

				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<button type="button" onClick={handleFetchPoster} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#f3f4f6' }}>
						{loading ? 'Fetching…' : 'Fetch poster'}
					</button>
					{posterUrl ? (
						<img src={posterUrl} alt="Poster preview" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/poster-placeholder.svg'; }} style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
					) : (
						<img src="/poster-placeholder.svg" alt="No poster" style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
					)}
				</div>

				<label>
					<div>Year released</div>
					<input type="text" value={detectedYear} readOnly style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, background: '#f9fafb' }} />
				</label>

				<label>
					<div>Genre</div>
					<input
						type="text"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
						placeholder={detectedGenres || 'e.g., Horror, Thriller'}
						style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
					/>
				</label>


				<label>
					<div>Rating (1–10, optional)</div>
					<select
						value={rating}
						onChange={(e) => setRating(e.target.value)}
						style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
					>
						<option value="">No rating</option>
						{Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
							<option key={n} value={String(n)}>
								{n}
							</option>
						))}
					</select>
				</label>

				{error && <div style={{ color: '#b91c1c' }}>{error}</div>}
				{success && <div style={{ color: '#065f46' }}>{success}</div>}

				<button type="submit" disabled={loading} style={{ padding: '10px 14px', borderRadius: 8, background: '#111827', color: '#fff', border: 'none' }}>
					{loading ? 'Saving…' : 'Add Movie'}
				</button>
			</form>
		</div>
	);
}

