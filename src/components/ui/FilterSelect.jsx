import React from 'react';

export default function FilterSelect({ value, onChange, counts = {}, className = '', id, ...props }) {
  const { all = 0, watched = 0, unwatched = 0 } = counts;
  return (
    <select
      value={value}
      onChange={onChange}
      id={id}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white ${className}`}
      {...props}
    >
      <option value="all">Todos ({all})</option>
      <option value="watched">Vistos ({watched})</option>
      <option value="unwatched">Não vistos ({unwatched})</option>
      <option value="rating">Por Avaliação</option>
    </select>
  );
}
