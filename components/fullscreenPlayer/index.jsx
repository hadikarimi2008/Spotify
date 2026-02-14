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
  Minimize2,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function FullscreenPlayer({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffled,
  repeatMode,
  isLiked,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onVolumeChange,
  onTimeUpdate,
  onClose,
}) {
  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = (e) => {
    const newTime = parseFloat(e.target.value);
    onTimeUpdate(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    onVolumeChange(newVolume);
  };

  const toggleMute = () => {
    onVolumeChange(volume === 0 ? 70 : 0);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in fade-in duration-300">
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="text-white hover:text-[#1DB954] transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Close fullscreen"
        >
          <Minimize2 size={24} className="md:w-8 md:h-8" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-8 md:py-12 gap-4 md:gap-8">
        {/* Album Art */}
        <div className="relative w-full max-w-[400px] md:max-w-[600px] aspect-square rounded-lg overflow-hidden shadow-2xl">
          {currentSong?.imageUrl ? (
            <Image
              src={currentSong.imageUrl}
              alt={currentSong.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
          )}
        </div>

        {/* Song Info */}
        <div className="text-center w-full max-w-[600px] px-4">
          <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 truncate">
            {currentSong?.title || "No song selected"}
          </h1>
          <p className="text-sm md:text-xl lg:text-2xl text-[#b3b3b3] truncate">
            {currentSong?.artist?.name || "Select a song to play"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-[600px] px-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleTimeUpdate}
            className="w-full h-1 md:h-2 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#1DB954] hover:accent-[#1ed760] transition-colors"
            style={{
              background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${(currentTime / (duration || 1)) * 100}%, #4d4d4d ${(currentTime / (duration || 1)) * 100}%, #4d4d4d 100%)`,
            }}
          />
          <div className="flex justify-between text-xs md:text-sm text-[#b3b3b3] mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-[600px] px-4">
          {/* Main Controls */}
          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={onToggleShuffle}
              className={`transition-colors ${
                isShuffled ? "text-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
              }`}
              aria-label="Shuffle"
            >
              <Shuffle size={18} className="md:w-6 md:h-6" fill={isShuffled ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onSkipBack}
              className="text-[#b3b3b3] hover:text-white transition-colors"
              aria-label="Previous"
            >
              <SkipBack size={20} className="md:w-8 md:h-8" fill="currentColor" />
            </button>
            <button
              onClick={onTogglePlay}
              disabled={!currentSong}
              className={`p-2 md:p-4 rounded-full hover:scale-105 active:scale-95 transition-transform ${
                currentSong
                  ? "bg-white text-black"
                  : "bg-[#333] text-[#666] cursor-not-allowed"
              }`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={24} className="md:w-10 md:h-10" fill="black" />
              ) : (
                <Play size={24} className="md:w-10 md:h-10" fill="black" />
              )}
            </button>
            <button
              onClick={onSkipForward}
              className="text-[#b3b3b3] hover:text-white transition-colors"
              aria-label="Next"
            >
              <SkipForward size={20} className="md:w-8 md:h-8" fill="currentColor" />
            </button>
            <button
              onClick={onToggleRepeat}
              className={`relative transition-colors ${
                repeatMode > 0 ? "text-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
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
                className="md:w-6 md:h-6"
                fill={repeatMode > 0 ? "currentColor" : "none"}
              />
              {repeatMode === 2 && (
                <span className="absolute -top-1 -right-1 text-[10px] md:text-xs font-bold text-[#1DB954] leading-none">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Volume & Like Controls */}
          <div className="flex items-center gap-4 md:gap-6 w-full justify-center">
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(currentSong)}
              className={`transition-colors ${
                isLiked ? "text-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
              }`}
              aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} className="md:w-6 md:h-6" fill={isLiked ? "currentColor" : "none"} />
            </button>
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolume(true)}
                className="text-[#b3b3b3] hover:text-white transition-colors"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? (
                  <VolumeX size={18} className="md:w-6 md:h-6" />
                ) : (
                  <Volume2 size={18} className="md:w-6 md:h-6" />
                )}
              </button>
              <div
                className="flex items-center gap-2"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <div
                  className={`flex items-center transition-all duration-300 ease-out ${
                    showVolume ? "w-20 md:w-32 opacity-100" : "w-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="h-1 md:h-2 w-full bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#1DB954] hover:accent-[#1ed760] transition-colors"
                    style={{
                      background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${volume}%, #4d4d4d ${volume}%, #4d4d4d 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

