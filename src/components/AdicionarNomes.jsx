import { useState } from 'react';
import { adicionarNomeAPI } from '../services/api';

export default function AdicionarNomes() {
  const [novoNome, setNovoNome] = useState('');

  async function adicionarNome() {
    if (!novoNome) return;
    try {
      await adicionarNomeAPI(novoNome);
      setNovoNome('');
    } catch (error) {
      console.error('Erro ao adicionar nome:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-72 h-fit">
      <h2 className="text-lg font-semibold mb-3">Adicionar Nomes</h2>
      
      <form onSubmit={adicionarNome} className="flex gap-1 mb-3">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome"
          className="flex-1 border border-gray-300 ps-3 py-2 rounded"
        />
        <button type="submit" disabled={!novoNome} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Adicionar
        </button>
      </form>
    </div>
  );
}
