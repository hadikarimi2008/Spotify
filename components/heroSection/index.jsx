"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart, Share2 } from "lucide-react";
import { getSongs, getTopAlbums, getTopArtists } from "@/app/actions";
import { useSession } from "next-auth/react";
import { addToFavorites, removeFromFavorites, getFavoriteSongs } from "@/app/dashboard/actions";
import { getAllGenres } from "@/lib/genres";

export default function HeroSection() {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedGenre, setSelectedGenre] = useState(null);
  const genres = useMemo(() => getAllGenres(), []);
  const { data: session } = useSession();

  // Shuffle array function for random order
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    try {
      const [songsData, albumsData, artistsData] = await Promise.all([
        getSongs(20, selectedGenre),
        getTopAlbums(3),
        getTopArtists(5)
      ]);
      setSongs(songsData);
      // Shuffle albums and artists for random display
      setAlbums(shuffleArray(albumsData));
      setArtists(shuffleArray(artistsData));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, shuffleArray]);

  const loadFavorites = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const result = await getFavoriteSongs(session.user.id);
      if (result.success) {
        const ids = new Set(result.data.map(s => s.id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadSongs();
    if (session?.user?.id) {
      loadFavorites();
    }
  }, [loadSongs, loadFavorites, session?.user?.id]);

  const toggleFavorite = useCallback(async (song) => {
    if (!session?.user?.id) {
      console.warn("⚠️ Cannot toggle favorite: User not logged in");
      return;
    }

    if (!song || !song.id) {
      console.error("❌ Cannot toggle favorite: Invalid song data");
      return;
    }

    const isFavorite = favoriteIds.has(song.id);

    try {
      if (isFavorite) {
        console.log("🗑️ Removing from favorites:", song.id);
        const result = await removeFromFavorites(session.user.id, song.id);
        if (result.success) {
          setFavoriteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(song.id);
            return newSet;
          });
          // Dispatch event for real-time update
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("favoriteUpdated", { detail: { songId: song.id, added: false } }));
          }
          console.log("✅ Removed from favorites");
        } else {
          console.error("❌ Failed to remove from favorites:", result.error);
        }
      } else {
        console.log("➕ Adding to favorites:", song.id);
        const result = await addToFavorites(session.user.id, song.id);
        if (result.success) {
          setFavoriteIds(prev => new Set(prev).add(song.id));
          // Dispatch event for real-time update
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("favoriteUpdated", { detail: { songId: song.id, added: true, song: result.data } }));
          }
          console.log("✅ Added to favorites");
        } else {
          console.error("❌ Failed to add to favorites:", result.error);
          alert(result.error || "Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("❌ Error toggling favorite:", error);
      console.error("Error details:", {
        message: error.message,
        songId: song.id,
        userId: session.user.id,
      });
      alert("An error occurred. Please check the console for details.");
    }
  }, [session?.user?.id, favoriteIds]);

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

  const handleShare = useCallback(async (e, song) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/song/${song.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `Listen to ${song.title} by ${song.artist?.name || "Unknown Artist"}`,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          await navigator.clipboard.writeText(shareUrl);
          alert("Link copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  }, []);

  const handlePlayAlbum = useCallback(async (album) => {
    // Fetch album songs and play first one
    try {
      const { getSongs } = await import("@/app/actions");
      const allSongs = await getSongs(100);
      const albumSongs = allSongs.filter(song => song.albumId === album.id);
      
      if (albumSongs.length > 0 && typeof window !== "undefined" && window.playSong) {
        window.playSong(albumSongs[0]);
      }
    } catch (error) {
      console.error("Error playing album:", error);
    }
  }, []);

  const handlePlayArtist = useCallback(async (artist) => {
    // Fetch artist songs and play first one
    try {
      const { getSongs } = await import("@/app/actions");
      const allSongs = await getSongs(100);
      const artistSongs = allSongs.filter(song => song.artistId === artist.id);
      
      if (artistSongs.length > 0 && typeof window !== "undefined" && window.playSong) {
        window.playSong(artistSongs[0]);
      }
    } catch (error) {
      console.error("Error playing artist:", error);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full md:ml-5 flex-1 bg-[#121212] h-[calc(100vh-200px)] md:h-[80svh] rounded-[8px] md:rounded-[10px] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full md:ml-5 flex-1 bg-[#121212] h-[calc(100vh-200px)] md:h-[80svh] rounded-[8px] md:rounded-[10px] overflow-y-auto overflow-x-hidden hero-scrollbar pb-20 md:pb-0">
      <div className="p-4 md:p-6">
        {/* Top Artists Section */}
        {artists.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Popular Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="group flex flex-col items-center cursor-pointer"
                  onClick={() => handlePlayArtist(artist)}
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 bg-gradient-to-br from-purple-700 to-blue-900">
                    {artist.imageUrl ? (
                      <Image
                        src={artist.imageUrl}
                        alt={artist.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1DB954] hover:bg-[#1ed760] rounded-full p-2 md:p-3 shadow-lg">
                        <Play size={20} className="md:w-6 md:h-6" fill="black" />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/artist/${artist.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-white font-semibold text-xs md:text-sm text-center truncate w-full hover:underline"
                  >
                    {artist.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Albums Section */}
        {albums.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">New Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="group bg-[#1a1a1a] hover:bg-[#242424] rounded-lg p-4 transition-colors cursor-pointer"
                  onClick={() => handlePlayAlbum(album)}
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-700 to-blue-900">
                    {album.imageUrl ? (
                      <Image
                        src={album.imageUrl}
                        alt={album.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1DB954] hover:bg-[#1ed760] rounded-full p-3 shadow-lg">
                        <Play size={24} fill="black" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-sm md:text-base truncate mb-1">
                    {album.title}
                  </h3>
                  <p className="text-[#b3b3b3] text-xs md:text-sm truncate">
                    {album.artist?.name || "Unknown Artist"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-white text-xl md:text-2xl font-bold">Popular Songs</h2>
        </div>
        
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedGenre === null
                ? "bg-[#1DB954] text-white"
                : "bg-[#242424] text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedGenre === genre
                  ? "bg-[#1DB954] text-white"
                  : "bg-[#242424] text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {songs.length === 0 ? (
          <div className="text-[#b3b3b3] text-center py-12">
            No songs found
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song, index) => {
              const isFavorite = favoriteIds.has(song.id);
              return (
                <div
                  key={song.id}
                  className="flex items-center gap-2 md:gap-4 p-2 rounded-md hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="w-6 md:w-10 text-[#b3b3b3] text-xs md:text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden shrink-0">
                    {song.imageUrl ? (
                      <Image
                        src={song.imageUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 48px, 56px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-xs md:text-sm font-medium truncate hover:underline cursor-pointer">
                      {song.title}
                    </h4>
                    {song.artist?.id ? (
                      <Link
                        href={`/artist/${song.artist.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#b3b3b3] text-[10px] md:text-xs truncate hover:underline hover:text-white"
                      >
                        {song.artist.name}
                      </Link>
                    ) : (
                      <p className="text-[#b3b3b3] text-[10px] md:text-xs truncate">
                        Unknown Artist
                      </p>
                    )}
                  </div>
                  <div className="hidden md:block text-[#b3b3b3] text-sm">
                    {song.album?.title || "-"}
                  </div>
                  <div className="hidden lg:block text-[#b3b3b3] text-sm">
                    {formatDuration(song.duration)}
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      className={`transition-colors ${
                        isFavorite
                          ? "text-[#1DB954] hover:text-[#1ed760]"
                          : "text-[#b3b3b3] hover:text-white"
                      }`}
                      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart size={16} className="md:w-[18px] md:h-[18px]" fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, song)}
                      className="text-[#b3b3b3] hover:text-white transition-colors"
                      title="Share"
                    >
                      <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
