"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Play, Music, User, Disc } from "lucide-react";
import { searchSongs } from "@/app/actions";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      loadResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const data = await searchSongs(query);
      setResults(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song) => {
    if (typeof window !== "undefined" && window.playSong) {
      window.playSong(song);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        {query && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === "all"
                  ? "bg-white text-black"
                  : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("songs")}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === "songs"
                  ? "bg-white text-black"
                  : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => setActiveTab("artists")}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === "artists"
                  ? "bg-white text-black"
                  : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              Artists
            </button>
            <button
              onClick={() => setActiveTab("albums")}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === "albums"
                  ? "bg-white text-black"
                  : "bg-[#242424] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              Albums
            </button>
          </div>
        )}

        {!query ? (
          <div className="text-center py-20">
            <p className="text-[#b3b3b3] text-lg">Start searching for songs, artists, or albums</p>
          </div>
        ) : (
          <>
            {(activeTab === "all" || activeTab === "songs") && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Songs</h2>
                {results.songs.length > 0 ? (
                  <div className="space-y-2">
                    {results.songs.map((song, index) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-3 rounded-md hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                        onClick={() => playSong(song)}
                      >
                        <div className="w-10 text-[#b3b3b3] text-sm font-medium shrink-0">
                          {index + 1}
                        </div>
                        <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0">
                          {song.imageUrl ? (
                            <Image
                              src={song.imageUrl}
                              alt={song.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate hover:underline">
                            {song.title}
                          </h3>
                          <p className="text-[#b3b3b3] text-sm truncate">
                            {song.artist?.name || "Unknown Artist"}
                          </p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:scale-110">
                          <Play size={20} fill="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#b3b3b3]">No songs found</p>
                )}
              </div>
            )}

            {(activeTab === "all" || activeTab === "artists") && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Artists</h2>
                {results.artists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.artists.map((artist) => (
                      <div
                        key={artist.id}
                        className="flex flex-col items-center p-4 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                      >
                        <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 bg-[#333]">
                          {artist.imageUrl ? (
                            <Image
                              src={artist.imageUrl}
                              alt={artist.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900 flex items-center justify-center">
                              <User size={40} className="text-white opacity-50" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-medium text-center truncate w-full">
                          {artist.name}
                        </h3>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#b3b3b3]">No artists found</p>
                )}
              </div>
            )}

            {(activeTab === "all" || activeTab === "albums") && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Albums</h2>
                {results.albums.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.albums.map((album) => (
                      <div
                        key={album.id}
                        className="flex flex-col p-4 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                      >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#333]">
                          {album.imageUrl ? (
                            <Image
                              src={album.imageUrl}
                              alt={album.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900 flex items-center justify-center">
                              <Disc size={40} className="text-white opacity-50" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-medium truncate mb-1">{album.title}</h3>
                        <p className="text-[#b3b3b3] text-sm truncate">{album.artist?.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#b3b3b3]">No albums found</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
