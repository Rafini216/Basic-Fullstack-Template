import AdicionarNomes from '../components/AdicionarNomes';
import VerNomes from '../components/VerNomes';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
        <VerNomes />
        <AdicionarNomes />
      </div>
    </div>
  );
}
