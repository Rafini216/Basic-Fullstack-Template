import React from 'react';
import TitleAutocomplete from './TitleAutocomplete';

export default function TitleAutocompleteWithMeta({
  value,
  onChange,
  setPosterUrl,
  setYear,
  setGenre,
  setDetectedGenres, // optional; receives comma-joined genres
  setImdbID,
  skipFirstSearch = false, //ao editar um filme, saltar a primeira busca
  placeholder = 'ex: A Origem',
  ...props
}) {
  const handleMeta = (meta) => {
    if (!meta) return;
    // poster
    if (meta.posterUrl && typeof setPosterUrl === 'function') setPosterUrl(meta.posterUrl);
    // year
    if (meta.year && typeof setYear === 'function') setYear(String(meta.year));
    // genres
    if (Array.isArray(meta.genres)) {
      const autoGenres = meta.genres.join(', ');
      if (typeof setDetectedGenres === 'function') setDetectedGenres(autoGenres);
    
      if (typeof setGenre === 'function' && autoGenres) setGenre(autoGenres);
    }
    // imdb
    if (meta.imdbID && typeof setImdbID === 'function') setImdbID(meta.imdbID);
    //title
    if (meta.title && typeof onChange === 'function' && meta.title !== value) {
      onChange(meta.title);
    }
  };

  return (
    <TitleAutocomplete
      value={value}
      onChange={onChange}
      onMeta={handleMeta}
      skipFirstSearch={skipFirstSearch}
      placeholder={placeholder}
      {...props}
    />
  );
}
