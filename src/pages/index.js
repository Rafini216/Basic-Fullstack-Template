import AddMovie from '../components/AddMovie';
import AllMovies from '../components/AllMovies';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen p-5 flex items-center justify-center">
      <div className="w-[390px] max-w-full mx-auto flex flex-col gap-5">
        <AddMovie />
        <AllMovies />
      </div>
    </div>
  );
}
