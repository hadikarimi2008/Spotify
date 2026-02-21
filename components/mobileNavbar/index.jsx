/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Music,
  User,
  Bell,
  LogOut,
  Settings,
  X,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import YourLibrary from "@/components/yourLibrary";
import { searchSongs } from "@/app/actions";
import DeveloperModal from "../DeveloperModal";

export default function MobileNavbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const results = await searchSongs(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults(null);
          setShowSearchResults(false);
        }
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-[#2a2a2a]">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 active:scale-95 transition-transform"
          >
            <Home size={22} className="text-[#c4c4c4]" />
            <span className="text-[10px] text-[#c4c4c4]">Home</span>
          </Link>

          {/* Library */}
          <button type="button" aria-label="Open Library" onClick={() => setShowLibrary(true)} className="flex flex-col items-center justify-center gap-1 flex-1 py-2 active:scale-95 transition-transform">
            <Music size={22} className="text-[#c4c4c4]" />
            <span className="text-[10px] text-[#c4c4c4]">Library</span>
          </button>

          {/* Search */}
          <button type="button" aria-label="Open Search" onClick={() => setShowSearch(true)} className="flex flex-col items-center justify-center gap-1 flex-1 py-2 active:scale-95 transition-transform">
            <Search size={22} className="text-[#c4c4c4]" />
            <span className="text-[10px] text-[#c4c4c4]">Search</span>
          </button>

          {/* Notifications */}
          <button type="button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)} className="flex flex-col items-center justify-center gap-1 flex-1 py-2 active:scale-95 transition-transform relative">
            <Bell size={22} className="text-[#c4c4c4]" />
            <span className="text-[10px] text-[#c4c4c4]">Notifications</span>
          </button>

          {/* Profile */}
          <button type="button" aria-label="Profile" onClick={() => setShowProfile(!showProfile)} className="flex flex-col items-center justify-center gap-1 flex-1 py-2 active:scale-95 transition-transform">
            {status === "loading" ? (
              <div className="w-6 h-6 rounded-full bg-[#242424] animate-pulse" />
            ) : session?.user ? (
              session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={22}
                  height={22}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
                  <User size={14} color="white" />
                </div>
              )
            ) : (
              <User size={22} className="text-[#c4c4c4]" />
            )}
            <span className="text-[10px] text-[#c4c4c4]">Profile</span>
          </button>
        </div>
      </nav>

      {/* Library Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black transition-transform duration-300 ease-in-out ${
          showLibrary ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-black/95 backdrop-blur-sm z-10 p-4 flex items-center justify-between border-b border-[#2a2a2a]">
            <h2 className="text-white text-xl font-bold">Your Library</h2>
            <button
              onClick={() => setShowLibrary(false)}
              className="text-[#c4c4c4] hover:text-white transition-colors p-2"
              aria-label="Close Library"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-4 pb-24">
            <YourLibrary />
          </div>
        </div>
      </div>

      {/* Notifications Overlay */}
      {showNotifications && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl border-t border-[#2a2a2a] max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between sticky top-0 bg-[#121212]">
              <h3 className="text-white font-bold text-lg">Notifications</h3>
              <button type="button" onClick={() => setShowNotifications(false)} className="text-[#c4c4c4] hover:text-white transition-colors p-2" aria-label="Close notifications">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 text-center">
              <p className="text-[#c4c4c4] text-sm">You have no messages</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Overlay */}
      {showProfile && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#121212] rounded-t-2xl border-t border-[#2a2a2a] max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between sticky top-0 bg-[#121212]">
              <h3 className="text-white font-bold text-lg">Profile</h3>
              <button type="button" onClick={() => setShowProfile(false)} className="text-[#c4c4c4] hover:text-white transition-colors p-2" aria-label="Close profile">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {status === "loading" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#242424] animate-pulse mx-auto mb-4" />
                  <div className="h-4 bg-[#242424] rounded w-32 mx-auto animate-pulse" />
                </div>
              ) : session?.user ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#1DB954] flex items-center justify-center">
                        <User size={32} color="white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg">
                        {session.user.name || session.user.email}
                      </h4>
                      <p className="text-[#c4c4c4] text-sm flex items-center">
                        {session.user.email}
                         <DeveloperModal/>
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#242424] rounded-lg transition-colors"
                  >
                    <User size={20} className="text-[#c4c4c4]" />
                    <span className="text-white font-medium">View Profile</span>
                  </Link>
                  <div></div>
                  {session.user.isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#242424] rounded-lg transition-colors"
                    >
                      <Settings size={20} className="text-[#1DB954]" />
                      <span className="text-white font-medium">
                        Admin Panel
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfile(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] hover:bg-[#242424] rounded-lg transition-colors text-left"
                  >
                    <LogOut size={20} className="text-red-400" />
                    <span className="text-red-400 font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#c4c4c4] mb-4">You are not logged in</p>
                  <Link
                    href="/login"
                    onClick={() => setShowProfile(false)}
                    className="inline-block px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold rounded-full transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {showSearch && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#2a2a2a] flex items-center gap-3 sticky top-0 bg-black z-10">
              <button type="button" onClick={() => setShowSearch(false)} className="text-[#c4c4c4] hover:text-white transition-colors p-2" aria-label="Close search">
                <X size={24} />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1 relative" ref={searchRef} role="search">
                <label htmlFor="mobile-search" className="sr-only">Search for songs and artists</label>
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c4c4]" aria-hidden="true" />
                <input
                  id="mobile-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchQuery.trim() && setShowSearchResults(true)
                  }
                  aria-label="Search for songs and artists"
                  className="w-full h-12 bg-[#242424] text-white rounded-full pl-11 pr-4 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all placeholder-[#9e9e9e]"
                  placeholder="What do you want to play?"
                  autoFocus
                />
              </form>
            </div>
            <div className="flex-1 overflow-y-auto relative">
              {showSearchResults && searchResults && (
                <div ref={resultsRef} className="p-4 space-y-4">
                  {searchResults.songs.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold text-lg mb-3">
                        Songs
                      </h3>
                      <div className="space-y-1">
                        {searchResults.songs.slice(0, 10).map((song) => (
                          <div
                            key={song.id}
                            onClick={() => {
                              if (
                                typeof window !== "undefined" &&
                                window.playSong
                              ) {
                                window.playSong(song);
                              }
                              setShowSearch(false);
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 p-3 rounded hover:bg-[#2a2a2a] cursor-pointer"
                          >
                            <div className="relative w-14 h-14 rounded overflow-hidden shrink-0">
                              {song.imageUrl ? (
                                <Image
                                  src={song.imageUrl}
                                  alt={song.title}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {song.title}
                              </p>
                              <p className="text-[#c4c4c4] text-xs truncate">
                                {song.artist?.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.artists.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold text-lg mb-3">
                        Artists
                      </h3>
                      <div className="space-y-1">
                        {searchResults.artists.slice(0, 10).map((artist) => (
                          <div
                            key={artist.id}
                            onClick={() => {
                              router.push(`/artist/${artist.id}`);
                              setShowSearch(false);
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 p-3 rounded hover:bg-[#2a2a2a] cursor-pointer"
                          >
                            <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-[#333]">
                              {artist.imageUrl ? (
                                <Image
                                  src={artist.imageUrl}
                                  alt={artist.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                              )}
                            </div>
                            <p className="text-white text-sm font-medium truncate">
                              {artist.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.albums.length > 0 && (
                    <div>
                      <h3 className="text-white font-bold text-lg mb-3">
                        Albums
                      </h3>
                      <div className="space-y-1">
                        {searchResults.albums.slice(0, 10).map((album) => (
                          <div
                            key={album.id}
                            onClick={() => {
                              router.push(`/share/album/${album.id}`);
                              setShowSearch(false);
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 p-3 rounded hover:bg-[#2a2a2a] cursor-pointer"
                          >
                            <div className="relative w-14 h-14 rounded overflow-hidden shrink-0">
                              {album.imageUrl ? (
                                <Image
                                  src={album.imageUrl}
                                  alt={album.title}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {album.title}
                              </p>
                              <p className="text-[#c4c4c4] text-xs truncate">
                                {album.artist?.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery.trim() && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full mt-4 p-3 text-center text-white bg-[#1DB954] hover:bg-[#1ed760] rounded-full font-medium transition-colors"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
              {!showSearchResults && searchQuery.trim().length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#c4c4c4] text-sm">
                    Start typing to search...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
