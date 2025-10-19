import React from 'react';
import { relativeDayPt } from '../../utils/date';

export default function MovieInfo({ title, imdbID, genre, year, createdAt, updatedAt, rating }) {
  const when = updatedAt || createdAt;
  return (
    <div className="flex-1">
      <div className="font-semibold flex items-center gap-2 flex-wrap">
        {imdbID ? (
          <a
            href={`https://www.imdb.com/title/${imdbID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 no-underline hover:underline"
          >
            {title}
          </a>
        ) : (
          <span>{title}</span>
        )}
        {rating ? (
          <span title="rating" className="text-xs text-gray-700">⭐ {rating}</span>
        ) : null}
      </div>
      <div className="text-gray-500 text-sm">{genre || '—'}</div>
      {year && <div className="text-gray-400 text-sm">Lançado em {year}</div>}
      <div className="text-gray-300 text-[10px] italic">
        <span className="mr-1">{updatedAt ? 'Editado' : 'Adicionado'}</span>
        {relativeDayPt(when)}
      </div>
    </div>
  );
}
