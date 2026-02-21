/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Maximize2,
  Heart,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToRecentlyPlayed } from "@/app/actions";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteSongs,
} from "@/app/dashboard/actions";
import FullscreenPlayer from "@/components/fullscreenPlayer";
import DeveloperModal from "../DeveloperModal";

export default function SpotifyPlayer() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const audioRef = useRef(null);
  const [songsList, setSongsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadInitialSong = useCallback(async () => {
    try {
      const { getSongs } = await import("@/app/actions");
      const songs = await getSongs(20);
      if (songs.length > 0) {
        setCurrentSong(songs[0]);
        setDuration(songs[0].duration);
        setSongsList(songs);
      }
    } catch (error) {
      console.error("Error loading song:", error);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const result = await getFavoriteSongs(session.user.id);
      if (result.success) {
        const ids = new Set(result.data.map((s) => s.id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadInitialSong();
    if (session?.user?.id) {
      loadFavorites();
    }

    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setVolume((prev) => Math.min(100, prev + 5));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setVolume((prev) => Math.max(0, prev - 5));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleSkipBack();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSkipForward();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [loadInitialSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.songUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          // AbortError = play() interrupted by new load; NotAllowedError = autoplay policy
          if (error?.name !== "AbortError" && error?.name !== "NotAllowedError") {
            console.error("Error playing audio:", error);
          }
        });
      }
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = async () => {
      // Track full play in listening history
      if (session?.user?.id && currentSong) {
        try {
          const { addToListeningHistory } =
            await import("@/app/dashboard/actions");
          await addToListeningHistory(
            session.user.id,
            currentSong.id,
            currentSong.duration,
          );
        } catch (error) {
          console.error("Error tracking listening history:", error);
        }
      }

      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 1 || isShuffled) {
        handleSkipForward();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    const handleError = (e) => {
      const mediaError = e?.target?.error;
      // MEDIA_ERR_ABORTED (1) = load was aborted (e.g. user switched song)
      if (mediaError?.code === 1) return;
      console.error("Audio playback error", mediaError?.message || "");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [repeatMode, isShuffled, currentSong, session]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          if (error?.name !== "AbortError" && error?.name !== "NotAllowedError") {
            console.error("Error playing audio:", error);
          }
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSkipBack = useCallback(() => {
    if (songsList.length === 0) return;

    let newIndex;
    if (isShuffled) {
      newIndex = Math.floor(Math.random() * songsList.length);
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : songsList.length - 1;
    }

    setCurrentIndex(newIndex);
    setCurrentSong(songsList[newIndex]);
    setIsPlaying(true);
  }, [songsList, currentIndex, isShuffled]);

  const handleSkipForward = useCallback(async () => {
    if (songsList.length === 0) {
      const { getSongs } = await import("@/app/actions");
      const songs = await getSongs(20);
      if (songs.length > 0) {
        setSongsList(songs);
        setCurrentIndex(0);
        setCurrentSong(songs[0]);
        setIsPlaying(true);
      }
      return;
    }

    let newIndex;
    if (isShuffled) {
      newIndex = Math.floor(Math.random() * songsList.length);
    } else {
      newIndex = currentIndex < songsList.length - 1 ? currentIndex + 1 : 0;
    }

    setCurrentIndex(newIndex);
    setCurrentSong(songsList[newIndex]);
    setIsPlaying(true);
  }, [songsList, currentIndex, isShuffled]);

  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => setRepeatMode((prev) => (prev + 1) % 3);

  const toggleFavorite = useCallback(
    async (song) => {
      if (!session?.user?.id || !song) return;

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
              window.dispatchEvent(
                new CustomEvent("favoriteUpdated", {
                  detail: { songId: song.id, added: false },
                }),
              );
            }
          }
        } else {
          const result = await addToFavorites(session.user.id, song.id);
          if (result.success) {
            setFavoriteIds((prev) => new Set(prev).add(song.id));
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("favoriteUpdated", {
                  detail: { songId: song.id, added: true, song: result.data },
                }),
              );
            }
          }
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    },
    [session?.user?.id, favoriteIds],
  );

  // Listen for favorite updates
  useEffect(() => {
    const handleFavoriteUpdate = (event) => {
      const { songId, added } = event.detail;
      if (added) {
        setFavoriteIds((prev) => new Set(prev).add(songId));
      } else {
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("favoriteUpdated", handleFavoriteUpdate);
      return () => {
        window.removeEventListener("favoriteUpdated", handleFavoriteUpdate);
      };
    }
  }, []);

  const handleTimeUpdate = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(70);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const setPlaylistAndPlay = useCallback((songs, startIndex = 0) => {
    if (!songs || songs.length === 0) return;
    const index = Math.min(Math.max(startIndex, 0), songs.length - 1);
    setSongsList(songs);
    setCurrentIndex(index);
    setCurrentSong(songs[index]);
    setIsPlaying(true);
  }, []);

  const playSong = useCallback(
    async (song) => {
      setCurrentSong(song);
      setIsPlaying(true);

      const songIndex = songsList.findIndex((s) => s.id === song.id);
      if (songIndex !== -1) {
        setCurrentIndex(songIndex);
      } else {
        const { getSongs } = await import("@/app/actions");
        const songs = await getSongs(20);
        setSongsList(songs);
        const newIndex = songs.findIndex((s) => s.id === song.id);
        setCurrentIndex(newIndex !== -1 ? newIndex : 0);
      }

      try {
        const { incrementPlayCount } = await import("@/app/actions");
        await incrementPlayCount(song.id);

        if (session?.user?.id) {
          await addToRecentlyPlayed(session.user.id, song.id);

          // Add to listening history
          const { addToListeningHistory } =
            await import("@/app/dashboard/actions");
          await addToListeningHistory(session.user.id, song.id, song.duration);
        }
      } catch (error) {
        console.error("Error updating play count:", error);
      }
    },
    [songsList, session],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.playSong = playSong;
      window.setPlaylistAndPlay = setPlaylistAndPlay;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.playSong;
        delete window.setPlaylistAndPlay;
      }
    };
  }, [playSong, setPlaylistAndPlay]);

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      {/* Fullscreen Player */}
      {isFullscreen && currentSong && (
        <FullscreenPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          isLiked={favoriteIds.has(currentSong.id)}
          onTogglePlay={togglePlay}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onToggleFavorite={toggleFavorite}
          onVolumeChange={setVolume}
          onTimeUpdate={(time) => {
            if (audioRef.current) {
              audioRef.current.currentTime = time;
            }
          }}
          onClose={() => setIsFullscreen(false)}
        />
      )}

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-black border-t border-[#282828 shadow-2xl">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="px-3 py-2.5 flex items-center justify-between gap-2">
            {/* Song Info */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative w-12 h-12 bg-[#282828] rounded-md overflow-hidden shrink-0">
                {currentSong?.imageUrl ? (
                  <Image
                    src={currentSong.imageUrl}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-purple-700 to-blue-900" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className="text-[13px] text-white font-medium truncate hover:underline cursor-pointer"
                  onClick={() => {
                    if (currentSong?.id) {
                      router.push(`/share/song/${currentSong.id}`);
                    }
                  }}
                >
                  {currentSong?.title || "No song selected"}
                </h4>
                <p
                  className="text-[11px] text-[#c4c4c4] truncate hover:underline cursor-pointer"
                  onClick={() => {
                    if (currentSong?.artist?.id) {
                      router.push(`/artist/${currentSong.artist.id}`);
                    }
                  }}
                >
                  {currentSong?.artist?.name || "Select a song to play"}
                </p>
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={togglePlay}
              disabled={!currentSong}
              className={`p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform shrink-0 ${
                currentSong
                  ? "bg-white text-black"
                  : "bg-[#333] text-[#666] cursor-not-allowed"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={18} fill="black" />
              ) : (
                <Play size={18} fill="black" />
              )}
            </button>
          </div>

          {/* Progress Bar Mobile */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#c4c4c4] min-w-[28px]">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleTimeUpdate}
                aria-label="Seek playback"
                className="h-1 flex-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1db954] transition-colors"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(currentTime / (duration || 1)) * 100}%, #4d4d4d ${(currentTime / (duration || 1)) * 100}%, #4d4d4d 100%)`,
                }}
              />
              <span className="text-[10px] text-[#c4c4c4] min-w-[28px] text-right">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${
                  isShuffled ? "text-[#1DB954]" : "text-[#c4c4c4]"
                }`}
                aria-label="Shuffle"
              >
                <Shuffle
                  size={18}
                  fill={isShuffled ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={handleSkipBack}
                className="text-[#c4c4c4] active:scale-95 transition-transform"
                aria-label="Previous"
              >
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                disabled={!currentSong}
                className={`p-2 rounded-full hover:scale-105 active:scale-95 transition-transform ${
                  currentSong
                    ? "bg-white text-black"
                    : "bg-[#333] text-[#666] cursor-not-allowed"
                }`}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={20} fill="black" />
                ) : (
                  <Play size={20} fill="black" />
                )}
              </button>
              <button
                onClick={handleSkipForward}
                className="text-[#c4c4c4] active:scale-95 transition-transform"
                aria-label="Next"
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`relative transition-colors ${
                  repeatMode > 0 ? "text-[#1DB954]" : "text-[#c4c4c4]"
                }`}
                aria-label={
                  repeatMode === 0
                    ? "Repeat off"
                    : repeatMode === 1
                      ? "Repeat all"
                      : "Repeat one"
                }
              >
                <Repeat
                  size={18}
                  fill={repeatMode > 0 ? "currentColor" : "none"}
                />
                {repeatMode === 2 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[7px] font-bold text-[#1DB954] leading-none">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-[#c4c4c4] active:scale-95 transition-transform"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                className="h-1 flex-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white active:accent-[#1db954]"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
                }}
              />
              <button
                onClick={() => currentSong && setIsFullscreen(true)}
                disabled={!currentSong}
                className="text-[#c4c4c4] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between px-6 h-[90px] gap-4">
          {/* Left: Song Info */}
          <div className="flex items-center gap-4 w-[30%] min-w-0">
            <div className="relative w-14 h-14 bg-[#282828] rounded-md overflow-hidden shrink-0">
              {currentSong?.imageUrl ? (
                <Image
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-purple-700 to-blue-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="text-[14px] text-white font-semibold hover:underline cursor-pointer truncate"
                onClick={() => {
                  if (currentSong?.id) {
                    router.push(`/share/song/${currentSong.id}`);
                  }
                }}
              >
                {currentSong?.title || "No song selected"}
              </h4>
              <p
                className="text-[12px] text-[#c4c4c4] hover:underline hover:text-white cursor-pointer transition-colors truncate"
                onClick={() => {
                  if (currentSong?.artist?.id) {
                    router.push(`/artist/${currentSong.artist.id}`);
                  }
                }}
              >
                {currentSong?.artist?.name || "Select a song to play"}
              </p>
            </div>
            <button
              onClick={() => currentSong && toggleFavorite(currentSong)}
              disabled={!currentSong}
              className={`transition-colors shrink-0 hidden lg:block ${
                currentSong && favoriteIds.has(currentSong.id)
                  ? "text-[#1DB954] hover:text-[#1ed760]"
                  : "text-[#c4c4c4] hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={
                currentSong && favoriteIds.has(currentSong.id)
                  ? "Unlike"
                  : "Like"
              }
            >
              <Heart
                size={18}
                fill={
                  currentSong && favoriteIds.has(currentSong.id)
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          </div>

          {/* Center: Controls */}
          <div className="flex flex-col items-center flex-1 max-w-[722px] gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleShuffle}
                className={`transition-colors ${
                  isShuffled
                    ? "text-[#1DB954]"
                    : "text-[#c4c4c4] hover:text-white"
                }`}
                aria-label="Shuffle"
              >
                <Shuffle
                  size={18}
                  fill={isShuffled ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={handleSkipBack}
                className="text-[#c4c4c4] hover:text-white transition-colors"
                aria-label="Previous"
              >
                <SkipBack size={22} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                disabled={!currentSong}
                className={`p-2 rounded-full hover:scale-105 active:scale-95 transition-transform ${
                  currentSong
                    ? "bg-white text-black"
                    : "bg-[#333] text-[#666] cursor-not-allowed"
                }`}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={22} fill="black" />
                ) : (
                  <Play size={22} fill="black" />
                )}
              </button>
              <button
                onClick={handleSkipForward}
                className="text-[#c4c4c4] hover:text-white transition-colors"
                aria-label="Next"
              >
                <SkipForward size={22} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`relative transition-colors ${
                  repeatMode > 0
                    ? "text-[#1DB954]"
                    : "text-[#c4c4c4] hover:text-white"
                }`}
                title={
                  repeatMode === 0
                    ? "Repeat off"
                    : repeatMode === 1
                      ? "Repeat all"
                      : "Repeat one"
                }
                aria-label={
                  repeatMode === 0
                    ? "Repeat off"
                    : repeatMode === 1
                      ? "Repeat all"
                      : "Repeat one"
                }
              >
                <Repeat
                  size={18}
                  fill={repeatMode > 0 ? "currentColor" : "none"}
                />
                {repeatMode === 2 && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold text-[#1DB954] leading-none">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-[11px] text-[#c4c4c4] min-w-[35px] text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleTimeUpdate}
                aria-label="Seek playback"
                className="h-1 flex-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1db954] transition-colors"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(currentTime / (duration || 1)) * 100}%, #4d4d4d ${(currentTime / (duration || 1)) * 100}%, #4d4d4d 100%)`,
                }}
              />
              <span className="text-[11px] text-[#c4c4c4] min-w-[35px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & More */}
          <div className="flex items-center gap-2 w-[30%] justify-end">
            <div className="flex items-center gap-2 group relative">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolume(true)}
                className="text-[#c4c4c4] hover:text-white transition-colors"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div
                className="flex items-center gap-2"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <div
                  className={`flex items-center transition-all duration-75 ease-out ${
                    showVolume
                      ? "w-24 opacity-100"
                      : "w-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                    className="h-1 w-full bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1db954] transition-colors"
                    style={{
                      background: `linear-gradient(to right, white 0%, white ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => currentSong && setIsFullscreen(true)}
                disabled={!currentSong}
                className="text-[#c4c4c4] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
                aria-label="Fullscreen"
              >
                <Maximize2 size={18} />
              </button>
              <DeveloperModal />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
