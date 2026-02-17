"use client";

import { Music, Heart } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getFavoriteSongs } from "@/app/dashboard/actions";
import { getRecentlyPlayed } from "@/app/actions";

export default function YourLibrary() {
  const { data: session } = useSession();
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const [favoritesResult, recentlyPlayedData] = await Promise.all([
        getFavoriteSongs(session.user.id),
        getRecentlyPlayed(session.user.id, 20),
      ]);

      setRecentlyPlayed(recentlyPlayedData || []);

      if (favoritesResult.success) {
        setFavoriteSongs(favoritesResult.data || []);
      } else {
        console.error("Failed to fetch favorite songs:", favoritesResult.error);
        setFavoriteSongs([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, fetchData]);

  // Listen for library update events
  useEffect(() => {
    const handleLibraryUpdate = () => {
      if (session?.user?.id) {
        fetchData();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("libraryUpdated", handleLibraryUpdate);
      window.addEventListener("favoriteUpdated", handleLibraryUpdate);
      return () => {
        window.removeEventListener("libraryUpdated", handleLibraryUpdate);
        window.removeEventListener("favoriteUpdated", handleLibraryUpdate);
      };
    }
  }, [session?.user?.id, fetchData]);

  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handlePlaySong = useCallback((song) => {
    if (typeof window !== "undefined" && window.playSong) {
      window.playSong(song);
    }
  }, []);

  return (
    <section className="flex flex-col w-full md:w-[300px] lg:w-[420px] bg-[#121212] h-[80svh] rounded-[8px] overflow-hidden">
      <div className="h-[64px] flex items-center justify-between font-bold text-[#b3b3b3] px-4 shrink-0">
        <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
          <h2 className="text-[16px]">Your Library</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 spotify-scrollbar">
        {loading ? (
          <div className="text-[#b3b3b3] text-center py-8">Loading...</div>
        ) : !session?.user ? (
          <div className="text-[#b3b3b3] text-center py-8 text-sm px-4">
            Please login to view your library
          </div>
        ) : (
          <>
            {favoriteSongs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[#b3b3b3] text-xs font-bold uppercase px-2 mb-2">
                  Favorite Songs
                </h3>
                <div className="space-y-1">
                  {favoriteSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                      onClick={() => handlePlaySong(song)}
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[#282828] flex items-center justify-center">
                        {song.imageUrl ? (
                          <Image
                            src={song.imageUrl}
                            alt={song.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                            loading="lazy"
                          />
                        ) : (
                          <Music size={24} className="text-[#b3b3b3]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">
                          {song.title}
                        </h4>
                        <p className="text-[#b3b3b3] text-xs truncate">
                          {song.artist?.name || "Unknown Artist"}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart
                          size={16}
                          className="text-[#1DB954] fill-[#1DB954]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {favoriteSongs.length === 0 && recentlyPlayed.length === 0 && (
              <div className="text-[#b3b3b3] text-center py-8 text-sm px-4">
                Your library is empty. Add songs to favorites.
              </div>
            )}
          </>
        )}

        {recentlyPlayed.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[#b3b3b3] text-xs font-bold uppercase px-2 mb-2">
              Recently Played
            </h3>
            <div className="space-y-1">
              {recentlyPlayed.slice(0, 7).map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-[#282828] flex items-center justify-center">
                    {song.imageUrl ? (
                      <Image
                        src={song.imageUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                        loading="lazy"
                      />
                    ) : (
                      <Music size={24} className="text-[#b3b3b3]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {song.title}
                    </h4>
                    <p className="text-[#b3b3b3] text-xs truncate">
                      {song.artist?.name || "Unknown Artist"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
