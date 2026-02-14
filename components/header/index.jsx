"use client";

import React, { useState, useEffect, useRef } from "react";
import logo from "@/public/logo/spotify.png";
import Image from "next/image";
import { Bell, Search, User, LogOut, X, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { searchSongs } from "@/app/actions";

export default function Header() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="hidden md:flex flex-col md:flex-row justify-between items-center py-2 px-2 md:px-5 w-full gap-3 md:gap-0">
      <div className="flex shrink-0 w-full md:w-auto justify-between md:justify-start items-center">
        <Image
          width={35}
          height={35}
          src={logo}
          alt="Logo"
          className="w-[35px] h-[35px] md:w-[50px] md:h-[50px] cursor-pointer"
          onClick={() => router.push("/")}
        />
        <div className="md:hidden flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-[#242424] animate-pulse" />
          ) : session?.user ? (
            <>
              {session.user.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1 px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-colors"
                  title="Admin Panel"
                >
                  <Settings size={14} color="white" />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-1 px-2 py-1 bg-[#242424] rounded-full hover:bg-[#2a2a2a] transition-colors"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
                    <User size={12} color="white" />
                  </div>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:scale-105 transition-transform"
                title="Logout"
              >
                <LogOut size={18} color="#d1d1d1" />
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-bold rounded-full transition-colors"
            >
              Login
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 hover:scale-105 transition-transform"
            >
              <Bell size={18} color="#d1d1d1" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#242424] rounded-lg shadow-xl border border-[#333] z-50">
                <div className="p-3 border-b border-[#333] flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#b3b3b3] hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6 text-center">
                  <p className="text-[#b3b3b3] text-sm">You have no messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center flex-1 justify-center px-2 md:px-4 w-full md:w-auto relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative group w-full max-w-[474px]">
          <span className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-[#b3b3b3] group-focus-within:text-white transition-colors">
            <Search size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            className="bg-[#242424] w-full h-[38px] md:h-[48px] text-[13px] md:text-[14px] font-medium text-white rounded-full pl-9 md:pl-12 pr-3 md:pr-4 outline-none border border-transparent hover:bg-[#2a2a2a] hover:border-[#333] focus:border-white focus:bg-[#2a2a2a] transition-all placeholder-[#757575] placeholder:font-normal"
            placeholder="What do you want to play?"
          />
        </form>

        {showSearchResults && searchResults && (
          <div
            ref={resultsRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-[474px] max-h-[60vh] overflow-y-auto bg-[#242424] rounded-lg shadow-xl border border-[#333] z-50"
          >
            <div className="p-4">
              {searchResults.songs.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm mb-2">Songs</h3>
                  <div className="space-y-1">
                    {searchResults.songs.slice(0, 5).map((song) => (
                      <div
                        key={song.id}
                        onClick={() => {
                          if (typeof window !== "undefined" && window.playSong) {
                            window.playSong(song);
                          }
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 rounded hover:bg-[#2a2a2a] cursor-pointer"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
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
                            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{song.title}</p>
                          <p className="text-[#b3b3b3] text-xs truncate">{song.artist?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.artists.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm mb-2">Artists</h3>
                  <div className="space-y-1">
                    {searchResults.artists.slice(0, 5).map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => {
                          router.push(`/artist/${artist.id}`);
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 rounded hover:bg-[#2a2a2a] cursor-pointer"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#333]">
                          {artist.imageUrl ? (
                            <Image
                              src={artist.imageUrl}
                              alt={artist.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                          )}
                        </div>
                        <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.albums.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-bold text-sm mb-2">Albums</h3>
                  <div className="space-y-1">
                    {searchResults.albums.slice(0, 5).map((album) => (
                      <div
                        key={album.id}
                        onClick={() => {
                          router.push(`/album/${album.id}`);
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 rounded hover:bg-[#2a2a2a] cursor-pointer"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                          {album.imageUrl ? (
                            <Image
                              src={album.imageUrl}
                              alt={album.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{album.title}</p>
                          <p className="text-[#b3b3b3] text-xs truncate">{album.artist?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery.trim() && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full mt-2 p-2 text-center text-white hover:bg-[#2a2a2a] rounded"
                >
                  See all results for "{searchQuery}"
                </button>
              )}
        </div>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center shrink-0 gap-2">
        {status === "loading" ? (
          <div className="w-8 h-8 rounded-full bg-[#242424] animate-pulse" />
        ) : session?.user ? (
          <>
            {session.user.isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-colors"
                title="Admin Panel"
              >
                <Settings size={16} color="white" />
                <span className="text-white text-sm font-medium hidden md:inline">Admin</span>
              </Link>
            )}
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#242424] rounded-full hover:bg-[#2a2a2a] transition-colors"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
                  <User size={14} color="white" />
                </div>
              )}
              <span className="text-white text-sm font-medium truncate max-w-[120px]">
                {session.user.name || session.user.email}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 hover:scale-105 transition-transform"
              title="Logout"
            >
              <LogOut size={20} color="#d1d1d1" className="md:w-6 md:h-6" />
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-bold rounded-full transition-colors"
          >
            Login
          </button>
        )}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:scale-105 transition-transform"
          >
          <Bell size={20} color="#d1d1d1" className="md:w-6 md:h-6" />
        </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#242424] rounded-lg shadow-xl border border-[#333] z-50">
              <div className="p-4 border-b border-[#333] flex items-center justify-between">
                <h3 className="text-white font-bold">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#b3b3b3] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-8 text-center">
                <p className="text-[#b3b3b3]">You have no messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
