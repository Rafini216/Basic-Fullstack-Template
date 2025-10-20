import React from 'react';

export default function FilterSelect({ value, onChange, counts = {}, className = ''}) {
  const { all = 0, watched = 0, unwatched = 0 } = counts;
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 ${className}`}>
      <option value="all">Todos ({all})</option>
      <option value="watched">Vistos ({watched})</option>
      <option value="unwatched">Não vistos ({unwatched})</option>
      <option value="rating">Por Avaliação</option>
    </select>
  );
}
