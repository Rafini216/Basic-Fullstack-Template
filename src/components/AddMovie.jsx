import React, { useEffect, useRef, useState } from 'react';
import { AddMovieAPI, lookupPosterAPI, searchMoviesAPI } from '../services/api';

export default function AddMovie() {
	const [title, setTitle] = useState('');
	const [genre, setGenre] = useState('');
	const [watched, setWatched] = useState(false);
	const [rating, setRating] = useState('');
	const [posterUrl, setPosterUrl] = useState('');
	const [detectedYear, setDetectedYear] = useState('');
	const [detectedGenres, setDetectedGenres] = useState('');
	const [detectedImdbID, setDetectedImdbID] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(-1);
	const debounceRef = useRef(0);
	const containerRef = useRef(null);
	const suppressNextSearchRef = useRef(false);

	const resetMessages = () => {
		setError('');
		setSuccess('');
	};



	// Debounced search suggestions when typing the title
	useEffect(() => {
		// Skip triggering search when we programmatically update the title
		if (suppressNextSearchRef.current) {
			suppressNextSearchRef.current = false;
			return;
		}
		const q = title.trim();
		window.clearTimeout(debounceRef.current);
		if (q.length < 2) {
			setSuggestions([]);
			setShowSuggestions(false);
			setHighlightIndex(-1);
			return;
		}
		debounceRef.current = window.setTimeout(async () => {
			try {
				const items = await searchMoviesAPI(q, 8);
				setSuggestions(items || []);
				setShowSuggestions((items || []).length > 0);
				setHighlightIndex(-1);
			} catch {
				setSuggestions([]);
				setShowSuggestions(false);
				setHighlightIndex(-1);
			}
		}, 400);
		return () => window.clearTimeout(debounceRef.current);
	}, [title]);

	// Close suggestions on outside click
	useEffect(() => {
		function handleClickOutside(e) {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setShowSuggestions(false);
			}
		}
		if (showSuggestions) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [showSuggestions]);

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

	const handlePickSuggestion = async (s) => {
		setShowSuggestions(false);
		setSuggestions([]);
		suppressNextSearchRef.current = true;
		setTitle(s.title);
		if (s.posterUrl) setPosterUrl(s.posterUrl);
		if (s.year) setDetectedYear(String(s.year));
		try {
			const meta = await lookupPosterAPI(s.title, s.year);
			applyPosterMeta(meta);
			if (meta.title && meta.title !== s.title) {
				suppressNextSearchRef.current = true;
				setTitle(meta.title);
			}
			setSuccess('Poster and metadata fetched.');
		} catch (e) {
			setError(e.message || 'Could not fetch metadata.');
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
				if (detectedImdbID) payload.imdbID = detectedImdbID;
			if (rating) payload.rating = Number(rating);

			await AddMovieAPI(payload);
			setSuccess('Filme adicionado com sucesso!');

			setTitle('');
			setGenre('');
			setWatched(false);
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
		<div style={{ background: '#ffffff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
			<h2 style={{ fontWeight: 700, marginBottom: 12 }}>Add Movie</h2>
			<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
				<label ref={containerRef} style={{ position: 'relative' }}>
					<div>Title</div>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
						placeholder="ex: A Origem"
						style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
					/>
					{showSuggestions && suggestions.length > 0 && (
						<div style={{ position: 'absolute', zIndex: 20, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 4, width: '100%', maxHeight: 240, overflowY: 'auto' }}>
							{suggestions.map((s, idx) => (
								<div
									key={s.id}
									onMouseDown={(e) => { e.preventDefault(); handlePickSuggestion(s); }}
									onMouseEnter={() => setHighlightIndex(idx)}
									style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: idx === highlightIndex ? '#f3f4f6' : '#fff', cursor: 'pointer' }}
								>
									<img src={s.posterUrl || '/poster-placeholder.svg'} alt="" style={{ width: 32, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
									<div style={{ display: 'flex', flexDirection: 'column' }}>
										<span style={{ fontWeight: 600 }}>{s.title}</span>
										<span style={{ fontSize: 12, color: '#6b7280' }}>
											{(s.year ? `(${s.year}) ` : '')}{s.originalTitle && s.originalTitle !== s.title ? ` • ${s.originalTitle}` : ''}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</label>

				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					{posterUrl ? (
						<img src={posterUrl} alt="Poster preview" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/poster-placeholder.svg'; }} style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
					) : (
						<img src="/poster-placeholder.svg" alt="No poster" style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
					)}
				</div>

				<label>
					<div>Ano de lançamento</div>
					<input type="text" value={detectedYear} readOnly style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8, background: '#f9fafb' }} />
				</label>

				<label>
					<div>Género</div>
					<input
						type="text"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
						placeholder={detectedGenres || 'e.g., Horror, Thriller'}
						style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
					/>
				</label>


				<label>
					<div>Rating</div>
					<select
						value={rating}
						onChange={(e) => setRating(e.target.value)}
						style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 8 }}
					>
						<option value="">Sem rating</option>
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
					{loading ? 'Saving…' : 'Adicionar Filme'}
				</button>
			</form>
		</div>
	);
}

