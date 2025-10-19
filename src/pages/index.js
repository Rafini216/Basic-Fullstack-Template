import AddMovie from '../components/AddMovie';
import AllMovies from '../components/AllMovies';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
        <AddMovie />
        <AllMovies />
      </div>
    </div>
  );
}
