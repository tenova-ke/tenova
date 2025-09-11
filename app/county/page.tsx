// app/country/page.tsx
"use client";

import { useState } from "react";

export default function CountryInfoPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountry = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch country info");
      const json = await res.json();
      if (!json.status) throw new Error("Country not found");
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-slate-800/70 backdrop-blur rounded-2xl p-6 border border-slate-700 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
          🌍 Country Info Finder
        </h1>
        <p className="text-center text-slate-400 mb-6">
          Search for any country and get detailed information.
        </p>

        <div className="flex gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter country name (e.g. Kenya)"
            className="flex-1 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={fetchCountry}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 transition shadow-md"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        {data && (
          <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <img src={data.flag} alt={data.name} className="w-16 h-12 rounded shadow" />
              <h2 className="text-2xl font-bold">{data.name}</h2>
              <span className="text-2xl">{data.continent?.emoji}</span>
            </div>

            <ul className="space-y-2 text-slate-300">
              <li><strong>Capital:</strong> {data.capital}</li>
              <li><strong>Phone Code:</strong> {data.phoneCode}</li>
              <li><strong>Continent:</strong> {data.continent?.name}</li>
              <li><strong>Coordinates:</strong> {data.coordinates.latitude}, {data.coordinates.longitude}</li>
              <li><strong>Area:</strong> {data.area.squareKilometers.toLocaleString()} km²</li>
              <li><strong>Currency:</strong> {data.currency}</li>
              <li><strong>Driving Side:</strong> {data.drivingSide}</li>
              <li><strong>Alcohol Prohibition:</strong> {data.alcoholProhibition}</li>
              <li><strong>Internet TLD:</strong> {data.internetTLD}</li>
              <li><strong>ISO:</strong> {data.isoCode.alpha2}, {data.isoCode.alpha3} ({data.isoCode.numeric})</li>
              <li><strong>Famous For:</strong> {data.famousFor}</li>
            </ul>

            {data.neighbors?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Neighbors:</h3>
                <div className="flex flex-wrap gap-3">
                  {data.neighbors.map((n: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2"
                    >
                      <img src={n.flag} alt={n.name} className="w-6 h-4 rounded" />
                      <span>{n.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <a
                href={data.googleMapsLink}
                target="_blank"
                className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 transition shadow-md inline-block"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
