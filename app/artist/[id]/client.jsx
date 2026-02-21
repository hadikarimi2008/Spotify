/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Play, Heart, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { addToFavorites, removeFromFavorites, getFavoriteSongs } from "@/app/dashboard/actions";
import { useState, useEffect } from "react";
import Link from "next/link";
import verified from "@/public/Verified/Blue-Tick.png";

export default function ArtistPageClient({ artist }) {
  const { data: session } = useSession();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!session?.user?.id) {
      setLoadingFavorites(false);
      return;
    }
    try {
      const songsResult = await getFavoriteSongs(session.user.id);
      if (songsResult.success) {
        const ids = new Set(songsResult.data.map((s) => s.id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoadingFavorites(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(
    async (song) => {
      if (!session?.user?.id) {
        return;
      }

      const isFavorite = favoriteIds.has(song.id);

      try {
        if (isFavorite) {
          const result = await removeFromFavorites(session.user.id, song.id);
          if (result.success) {
            setFavoriteIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(song.id);
              return newSet;
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("favoriteUpdated", { detail: { songId: song.id, added: false } }));
            }
          }
        } else {
          const result = await addToFavorites(session.user.id, song.id);
          if (result.success) {
            setFavoriteIds((prev) => new Set(prev).add(song.id));
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("favoriteUpdated", { detail: { songId: song.id, added: true, song: result.data } }));
            }
          }
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    },
    [session?.user?.id, favoriteIds]
  );


  const handlePlaySong = useCallback(
    (song) => {
      if (typeof window === "undefined") return;
      
      // Wait a bit for player to be ready
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryPlay = () => {
        attempts++;
        if (attempts > maxAttempts) {
          console.warn("Player not ready after multiple attempts");
          return;
        }
        
        if (window.setPlaylistAndPlay && Array.isArray(artist.songs)) {
          const index = artist.songs.findIndex((s) => s.id === song.id);
          window.setPlaylistAndPlay(artist.songs, index === -1 ? 0 : index);
        } else if (window.playSong) {
          window.playSong(song);
        } else {
          // Retry after a short delay if player not ready
          setTimeout(tryPlay, 100);
        }
      };
      
      tryPlay();
    },
    [artist.songs]
  );

  const handlePlayAll = useCallback(() => {
    if (!artist.songs || artist.songs.length === 0) return;
    if (typeof window === "undefined") return;
    
    // Wait a bit for player to be ready
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryPlay = () => {
      attempts++;
      if (attempts > maxAttempts) {
        console.warn("Player not ready after multiple attempts");
        return;
      }
      
      if (window.setPlaylistAndPlay && Array.isArray(artist.songs) && artist.songs.length > 0) {
        window.setPlaylistAndPlay(artist.songs, 0);
      } else if (window.playSong && artist.songs[0]) {
        window.playSong(artist.songs[0]);
      } else {
        // Retry after a short delay if player not ready
        setTimeout(tryPlay, 100);
      }
    };
    
    tryPlay();
  }, [artist.songs]);

  const handlePlayAlbum = useCallback(
    (album) => {
      const albumSongs = artist.songs.filter((song) => song.albumId === album.id);
      if (!albumSongs.length) return;
      if (typeof window === "undefined") return;
      
      // Wait a bit for player to be ready
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryPlay = () => {
        attempts++;
        if (attempts > maxAttempts) {
          console.warn("Player not ready after multiple attempts");
          return;
        }
        
        if (window.setPlaylistAndPlay) {
          window.setPlaylistAndPlay(albumSongs, 0);
        } else if (window.playSong) {
          window.playSong(albumSongs[0]);
        } else {
          // Retry after a short delay if player not ready
          setTimeout(tryPlay, 100);
        }
      };
      
      tryPlay();
    },
    [artist.songs]
  );

  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleShare = useCallback(async (e, type, id) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${type}/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: type === "artist" ? artist.name : type === "album" ? "Album" : "Song",
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
  }, [artist.name]);

  return (
    <div className="min-h-screen bg-black text-white pb-44 md:pb-24">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-b from-[#1a1a1a] to-black pb-8 md:pb-12 pt-16 md:pt-24"
        style={{
          backgroundImage: artist.imageUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(${artist.imageUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
            {/* Artist Image */}
            <div className="relative w-32 h-32 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0 shadow-2xl">
              {artist.imageUrl ? (
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 224px"
                  priority
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {artist.verified && (
                  <Image src={verified} width={50} height={50} loading="lazy" alt="Verified artist" />
                )}
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black truncate">
                  {artist.name}
                </h1>
              </div>
              <p className="text-[#c4c4c4] text-sm md:text-base mb-4">
                {artist._count.songs} {artist._count.songs === 1 ? "song" : "songs"} •{" "}
                {artist._count.albums} {artist._count.albums === 1 ? "album" : "albums"}
              </p>
              {artist.bio && (
                <div className="mb-4">
                  <p
                    className={`text-white text-sm md:text-base mb-2 ${
                      !showFullBio ? "line-clamp-2 md:line-clamp-3" : ""
                    }`}
                  >
                    {artist.bio}
                  </p>
                  {artist.bio.length > 150 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-[#c4c4c4] hover:text-white text-sm md:text-base font-medium transition-colors"
                    >
                      {showFullBio ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAll}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 md:px-8 py-2 md:py-3 rounded-full transition-colors flex items-center gap-2"
                >
                  <Play size={20} fill="black" />
                  <span className="hidden sm:inline">Play</span>
                </button>
                <button type="button" onClick={(e) => handleShare(e, "artist", artist.id)} className="p-2 md:p-3 border border-[#2a2a2a] hover:border-white rounded-full transition-colors" title="Share" aria-label="Share artist">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-44 md:pb-32">
        {/* Albums Section */}
        {artist.albums.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {artist.albums.map((album) => (
                <div
                  key={album.id}
                  className="group cursor-pointer"
                  onClick={() => handlePlayAlbum(album)}
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-purple-700 to-blue-900">
                    {album.imageUrl ? (
                      <Image
                        src={album.imageUrl}
                        alt={album.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button type="button" aria-label={`Play album ${album.title}`} className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1DB954] hover:bg-[#1ed760] rounded-full p-2 md:p-3 shadow-lg">
                        <Play size={20} className="md:w-6 md:h-6" fill="black" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-sm md:text-base truncate mb-1">
                    {album.title}
                  </h3>
                  <p className="text-[#c4c4c4] text-xs md:text-sm">{album.releaseYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Songs Section */}
        {artist.songs.length > 0 && (
          <div>
            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 md:mb-6">Popular</h2>
            <div className="space-y-1">
              {artist.songs.map((song, index) => {
                const isFavorite = favoriteIds.has(song.id);
                return (
                  <div
                    key={song.id}
                    className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-md hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
                    <div className="w-6 md:w-10 text-[#c4c4c4] text-xs md:text-sm font-medium shrink-0">
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
                      <h4 className="text-white text-xs md:text-sm font-medium truncate hover:underline">
                        {song.title}
                      </h4>
                      {song.album && (
                        <Link
                          href={`/share/album/${song.album.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#c4c4c4] text-[10px] md:text-xs truncate hover:underline hover:text-white block"
                        >
                          {song.album.title}
                        </Link>
                      )}
                    </div>
                    <div className="hidden md:block text-[#c4c4c4] text-sm">
                      {formatDuration(song.duration)}
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song);
                        }}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        className={`transition-colors ${
                          isFavorite
                            ? "text-[#1DB954] hover:text-[#1ed760]"
                            : "text-[#c4c4c4] hover:text-white"
                        }`}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          size={16}
                          className="md:w-[18px] md:h-[18px]"
                          fill={isFavorite ? "currentColor" : "none"}
                        />
                      </button>
                      <button type="button" onClick={(e) => handleShare(e, "song", song.id)} className="text-[#c4c4c4] hover:text-white transition-colors" title="Share" aria-label={`Share ${song.title}`}>
                        <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

