import React from 'react';

export default function MovieActions({ movie, onToggleWatched, onDelete, onEdit, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>

      <button
        onClick={() => onEdit && onEdit(movie)}
        title="Editar"
        className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer bg-blue-100 dark:bg-blue-900/30 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 sm:pointer-events-none sm:group-hover:pointer-events-auto transition-opacity"
      >
        <img src='/icons/pencil.svg' alt="Editar" className="w-4 h-4 dark:hidden" />
        <img src='/icons/pencil-white.svg' alt="Editar" className="w-4 h-4 hidden dark:inline" />
      </button>


      <button
        onClick={() => onDelete(movie)}
        title="Apagar"
        className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer bg-red-100 dark:bg-red-900/30 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 sm:pointer-events-none sm:group-hover:pointer-events-auto transition-opacity"
      >
        <img src='/icons/trash.svg' alt="Apagar" className="w-4 h-4 dark:hidden" />
        <img src='/icons/trash-white.svg' alt="Apagar" className="w-4 h-4 hidden dark:inline" />
      </button>


      <button
        onClick={() => onToggleWatched(movie)}
        title={movie.watched ? 'Marcar como não visto' : 'Marcar como visto'}
        className={`w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer ${movie.watched ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
      >
        {/* Light icons */}
        <img src={movie.watched ? '/icons/eye-open.svg' : '/icons/eye-closed.svg'} alt="Alternar visto" className="w-4 h-4 dark:hidden" />
        {/* Dark icons */}
        <img src={movie.watched ? '/icons/eye-open-white.svg' : '/icons/eye-closed-white.svg'} alt="Alternar visto" className="w-4 h-4 hidden dark:inline" />
      </button>
    </div>
  );
}
