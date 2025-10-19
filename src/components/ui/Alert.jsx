import React from 'react';

export default function Alert({ kind = 'info', children }) {
  const kindClass = kind === 'error' ? 'text-red-700' : kind === 'success' ? 'text-green-700' : 'text-gray-700';
  return <div className={kindClass}>{children}</div>;
}
