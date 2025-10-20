import React from 'react';

export default function RatingSelect({ value, onChange, className = '' }) {
  return (
    <select value={value} onChange={onChange} className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${className}`}>
      <option value="">Sem rating</option>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <option key={n} value={String(n)}>
          {n}
        </option>
      ))}
    </select>
  );
}
