import React from 'react';
import PosterImage from './PosterImage';

export default function SuggestionList({ items, highlightIndex, onPick, onHover }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="absolute z-20 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-sm">
      {items.map((s, idx) => (
        <div
          key={s.id}
          onMouseDown={(e) => { e.preventDefault(); onPick(s); }}
          onMouseEnter={() => onHover(idx)}
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 ${idx === highlightIndex ? 'bg-gray-100' : 'bg-white'}`}
        >
          <PosterImage src={s.posterUrl} alt="" className="w-8 h-12 object-cover rounded border border-gray-200" />
          <div className="flex flex-col">
            <span className="font-semibold">{s.title}</span>
            <span className="text-sm text-gray-500">
              {(s.year ? `(${s.year}) ` : '')}{s.originalTitle && s.originalTitle !== s.title ? ` • ${s.originalTitle}` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
