import { useState, useEffect } from 'react';
import { carregarNomesAPI } from '../services/api';

export default function VerNomes() {
  const [nomes, setNomes] = useState([]);

  async function carregarNomes() {
    try {
      const data = await carregarNomesAPI();
      setNomes(data);
    } catch (error) {
      console.error('Erro ao carregar nomes:', error);
    }
  }

  useEffect(() => {
    carregarNomes();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-72 h-fit">
      <h2 className="text-lg font-semibold mb-3">Nomes</h2>

      <div>
        {nomes.map((item) => (
          <div key={item._id}>
            {item.nome}
          </div>
        ))}
      </div>
    </div>
  );
}
