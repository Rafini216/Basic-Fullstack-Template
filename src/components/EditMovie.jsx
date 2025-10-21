import React, { useState } from 'react';
import FormField from './ui/FormField';
import RatingSelect from './ui/RatingSelect';
import TitleAutocompleteWithMeta from './ui/TitleAutocompleteWithMeta';
import PosterImage from './ui/PosterImage';

export default function EditMovie({ movie, onClose, onSave, saving = false }) {
  const [title, setTitle] = useState(movie?.title || '');
  const [genre, setGenre] = useState(movie?.genre || '');
  const [watched, setWatched] = useState(!!movie?.watched);
  const [rating, setRating] = useState(movie?.rating ? String(movie.rating) : '');
  const [posterUrl, setPosterUrl] = useState(movie?.posterUrl || '');
  const [detectedYear, setDetectedYear] = useState(movie?.year ? String(movie.year) : '');
  const [imdbID, setImdbID] = useState(movie?.imdbID || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const y = detectedYear && !Number.isNaN(Number(detectedYear)) ? Number(detectedYear) : undefined;
    onSave?.({
      title: title.trim(),
      genre: genre.trim(),
      watched,
      rating: rating ? Number(rating) : undefined,
      posterUrl: posterUrl || undefined,
      imdbID: imdbID || undefined,
      year: y,
    });
  };

  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center p-3">
      <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl w-full max-w-sm p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Editar Filme</h3>
          <button onClick={onClose} title="Fechar" className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-2">
          <FormField label="Título" className="relative">
            <TitleAutocompleteWithMeta
              value={title}
              onChange={setTitle}
              skipFirstSearch
              setPosterUrl={setPosterUrl}
              setYear={setDetectedYear}
              setGenre={setGenre}
              setImdbID={setImdbID}
            />
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
            <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100" value={genre} onChange={(e) => setGenre(e.target.value)} />
          </FormField>
          <FormField label="Rating">
            <RatingSelect value={rating} onChange={(e) => setRating(e.target.value)} />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={watched} onChange={(e) => setWatched(e.target.checked)} /> Marcado como visto
          </label>
          <div className="flex items-center gap-2 justify-end mt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800">Cancelar</button>
            <button type="submit" disabled={saving} className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
