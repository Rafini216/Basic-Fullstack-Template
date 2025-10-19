import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
