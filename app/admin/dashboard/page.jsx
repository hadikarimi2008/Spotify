/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Music,
  User,
  Disc,
  ListMusic,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Save,
  Search,
} from "lucide-react";
import { getAllArtists } from "@/lib/artists";
import { getAllGenres } from "@/lib/genres";
import {
  getSongs,
  createSong,
  updateSong,
  deleteSong,
  getArtists,
  createArtist,
  updateArtist,
  deleteArtist,
  getAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  uploadFile,
} from "./actions";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("songs");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [artistSuggestions] = useState(getAllArtists());
  const [artistSearchQuery, setArtistSearchQuery] = useState("");
  const genres = getAllGenres();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Data states
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Form states
  const [formData, setFormData] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (session?.user?.isAdmin) {
      loadData();
    }
  }, [activeTab, session]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "songs") {
        const result = await getSongs();
        if (result.success) setSongs(result.data);
      } else if (activeTab === "artists") {
        const result = await getArtists();
        if (result.success) {
          const sortedArtists = result.data.sort((a, b) => 
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
          setArtists(sortedArtists);
        }
      } else if (activeTab === "albums") {
        const result = await getAlbums();
        if (result.success) setAlbums(result.data);
      } else if (activeTab === "playlists") {
        const result = await getPlaylists();
        if (result.success) setPlaylists(result.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) {
      setError("Please select a file");
      return null;
    }

    // Check file size before upload
    const maxSize = type === "audio" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File is too large (${fileSizeMB}MB). Maximum size: ${type === "audio" ? "50MB" : "10MB"}`);
      return null;
    }

    setUploadingFile(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("type", type);

      console.log("Uploading file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadType: type
      });

      const result = await uploadFile(formDataToSend);
      
      if (result.success) {
        setSuccess("File uploaded successfully!");
        return result.url;
      } else {
        setError(result.error || "Failed to upload file");
        return null;
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload file: ${error.message || "Unknown error"}`);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const openCreateModal = () => {
    setModalType("create");
    setEditingId(null);
    setFormData({});
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalType("edit");
    setEditingId(item.id);
    setFormData({
      ...item,
      artistName: item.artist?.name || item.artistName || "",
      albumName: item.album?.title || item.albumName || "",
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;

      if (activeTab === "songs") {
        if (modalType === "create") {
          result = await createSong(formData);
        } else {
          result = await updateSong(editingId, formData);
        }
      } else if (activeTab === "artists") {
        if (modalType === "create") {
          result = await createArtist(formData);
        } else {
          result = await updateArtist(editingId, formData);
        }
      } else if (activeTab === "albums") {
        if (modalType === "create") {
          result = await createAlbum(formData);
        } else {
          result = await updateAlbum(editingId, formData);
        }
      } else if (activeTab === "playlists") {
        if (modalType === "create") {
          result = await createPlaylist(formData);
        } else {
          result = await updatePlaylist(editingId, formData);
        }
      }

      if (result.success) {
        setSuccess(`${activeTab.slice(0, -1)} ${modalType === "create" ? "created" : "updated"} successfully!`);
        closeModal();
        loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    setLoading(true);
    try {
      let result;
      if (activeTab === "songs") {
        result = await deleteSong(id);
      } else if (activeTab === "artists") {
        result = await deleteArtist(id);
      } else if (activeTab === "albums") {
        result = await deleteAlbum(id);
      } else if (activeTab === "playlists") {
        result = await deletePlaylist(id);
      }

      if (result.success) {
        setSuccess("Deleted successfully!");
        loadData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (!session.user.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-[#c4c4c4]">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading && songs.length === 0 && artists.length === 0 && albums.length === 0 && playlists.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      );
    }

    if (activeTab === "songs") {
      return (
        <div className="space-y-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors"
            >
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                {song.imageUrl && (
                  <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{song.title}</h4>
                <p className="text-[#c4c4c4] text-sm truncate">
                  {song.artist?.name || "Unknown"} {song.album && `• ${song.album.title}`}
                </p>
              </div>
              <div className="text-[#c4c4c4] text-sm">{formatDuration(song.duration)}</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openEditModal(song)} className="p-2 text-[#c4c4c4] hover:text-white transition-colors" aria-label={`Edit ${song.title}`}>
                  <Edit size={18} />
                </button>
                <button type="button" onClick={() => handleDelete(song.id)} className="p-2 text-[#c4c4c4] hover:text-red-400 transition-colors" aria-label={`Delete ${song.title}`}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "artists") {
      const filteredArtists = artists.filter(artist =>
        artist.name.toLowerCase().includes(artistSearchQuery.toLowerCase())
      );

      return (
        <>
          <div className="mb-4">
            <div className="relative">
              <label htmlFor="admin-search-artists" className="sr-only">Search artists</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c4c4]" size={20} aria-hidden="true" />
              <input
                id="admin-search-artists"
                type="search"
                value={artistSearchQuery}
                onChange={(e) => setArtistSearchQuery(e.target.value)}
                placeholder="Search artists..."
                aria-label="Search artists"
                className="w-full bg-[#242424] text-white rounded-md pl-10 pr-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtists.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#c4c4c4]">
                {artistSearchQuery ? "No artists found" : "No artists yet"}
              </div>
            ) : (
              filteredArtists.map((artist) => (
            <div
              key={artist.id}
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#242424] transition-colors"
            >
              <div className="w-full aspect-square rounded-full overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 mb-3">
                {artist.imageUrl && (
                  <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                )}
              </div>
              <h3 className="text-white font-semibold mb-1">{artist.name}</h3>
              <p className="text-[#c4c4c4] text-sm mb-3">
                {artist._count?.songs || 0} songs • {artist._count?.albums || 0} albums
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(artist)}
                  className="flex-1 px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-medium rounded-full transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(artist.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
              ))
            )}
          </div>
        </>
      );
    }

    if (activeTab === "albums") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <div
              key={album.id}
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#242424] transition-colors"
            >
              <div className="w-full aspect-square rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 mb-3">
                {album.imageUrl && (
                  <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
                )}
              </div>
              <h3 className="text-white font-semibold mb-1">{album.title}</h3>
              <p className="text-[#c4c4c4] text-sm mb-1">{album.artist?.name || "Unknown"}</p>
              <p className="text-[#c4c4c4] text-xs mb-3">{album.releaseYear} • {album._count?.songs || 0} songs</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(album)}
                  className="flex-1 px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-medium rounded-full transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(album.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "playlists") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#242424] transition-colors"
            >
              <div className="w-full aspect-square rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 mb-3">
                {playlist.imageUrl && (
                  <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                )}
              </div>
              <h3 className="text-white font-semibold mb-1">{playlist.name}</h3>
              <p className="text-[#c4c4c4] text-sm mb-3">
                {playlist._count?.songs || 0} songs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(playlist)}
                  className="flex-1 px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-medium rounded-full transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#121212] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex items-center justify-between">
            <h2 className="text-white text-2xl font-bold">
              {modalType === "create" ? "Create" : "Edit"} {activeTab.slice(0, -1)}
            </h2>
            <button
              onClick={closeModal}
              className="text-[#c4c4c4] hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {activeTab === "songs" && (
              <>
                <div>
                  <label htmlFor="admin-song-title" className="block text-white text-sm font-medium mb-2">Title *</label>
                  <input
                    id="admin-song-title"
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="admin-song-artist" className="block text-white text-sm font-medium mb-2">Artist Name *</label>
                  <div className="relative">
                    <input
                      id="admin-song-artist"
                      type="text"
                      list="artist-list-songs"
                      value={formData.artistName || formData.artist?.name || ""}
                      onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                      required
                      placeholder="Type or select artist name"
                      className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                    />
                    <datalist id="artist-list-songs">
                      {artistSuggestions.map((artist, index) => (
                        <option key={index} value={artist} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[#c4c4c4] text-xs mt-1">Select from list or type a new artist name</p>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Album Name</label>
                  <input
                    type="text"
                    value={formData.albumName || formData.album?.title || ""}
                    onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                    placeholder="Enter album name (optional)"
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                  <p className="text-[#c4c4c4] text-xs mt-1">Album will be created if it doesn't exist</p>
                </div>
                {formData.albumName && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Release Year</label>
                    <input
                      type="number"
                      value={formData.releaseYear || new Date().getFullYear()}
                      onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                      placeholder="Year"
                      className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Duration (seconds) *</label>
                  <input
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Genre</label>
                  <select
                    value={formData.genre || ""}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  >
                    <option value="">Select a genre (optional)</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Song File {modalType === "create" ? "*" : ""}
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, "audio");
                        if (url) {
                          setFormData({ ...formData, songUrl: url });
                        }
                      }
                    }}
                    required={modalType === "create"}
                    disabled={uploadingFile}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingFile && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Uploading...</p>
                  )}
                  {formData.songUrl && !uploadingFile && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Current: {formData.songUrl}</p>
                  )}
                  {modalType === "edit" && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Leave empty to keep current file</p>
                  )}
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Cover Image {modalType === "create" ? "*" : ""}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, "image");
                        if (url) {
                          setFormData({ ...formData, imageUrl: url });
                        }
                      }
                    }}
                    required={modalType === "create"}
                    disabled={uploadingFile}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingFile && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Uploading...</p>
                  )}
                  {formData.imageUrl && !uploadingFile && (
                    <div className="mt-2">
                      <p className="text-[#c4c4c4] text-xs mb-1">Current: {formData.imageUrl}</p>
                      <img src={formData.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                    </div>
                  )}
                  {modalType === "edit" && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Leave empty to keep current file</p>
                  )}
                </div>
              </>
            )}

            {activeTab === "artists" && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Profile Image {modalType === "create" ? "" : ""}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, "image");
                        if (url) {
                          setFormData({ ...formData, imageUrl: url });
                        }
                      }
                    }}
                    disabled={uploadingFile}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingFile && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Uploading...</p>
                  )}
                  {formData.imageUrl && !uploadingFile && (
                    <div className="mt-2">
                      <p className="text-[#c4c4c4] text-xs mb-1">Current: {formData.imageUrl}</p>
                      <img src={formData.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-full" />
                    </div>
                  )}
                  {modalType === "edit" && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Leave empty to keep current image</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified || false}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="verified" className="text-white text-sm">Verified Artist</label>
                </div>
              </>
            )}

            {activeTab === "albums" && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Artist Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      list="artist-list-albums"
                      value={formData.artistName || formData.artist?.name || ""}
                      onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                      required
                      placeholder="Type or select artist name"
                      className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                    />
                    <datalist id="artist-list-albums">
                      {artistSuggestions.map((artist, index) => (
                        <option key={index} value={artist} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[#c4c4c4] text-xs mt-1">Select from list or type a new artist name</p>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Release Year *</label>
                  <input
                    type="number"
                    value={formData.releaseYear || ""}
                    onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Cover Image {modalType === "create" ? "" : ""}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, "image");
                        if (url) {
                          setFormData({ ...formData, imageUrl: url });
                        }
                      }
                    }}
                    disabled={uploadingFile}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingFile && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Uploading...</p>
                  )}
                  {formData.imageUrl && !uploadingFile && (
                    <div className="mt-2">
                      <p className="text-[#c4c4c4] text-xs mb-1">Current: {formData.imageUrl}</p>
                      <img src={formData.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                    </div>
                  )}
                  {modalType === "edit" && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Leave empty to keep current image</p>
                  )}
                </div>
              </>
            )}

            {activeTab === "playlists" && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = await handleFileUpload(file, "image");
                        if (url) setFormData({ ...formData, imageUrl: url });
                      }
                    }}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                  {formData.imageUrl && (
                    <p className="text-[#c4c4c4] text-xs mt-1">Current: {formData.imageUrl}</p>
                  )}
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingFile}
                className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Saving..." : <><Save size={18} /> Save</>}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 bg-[#242424] hover:bg-[#2a2a2a] text-white font-medium rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white mb-[60%] md:mb-[0%]">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-[#c4c4c4] text-sm md:text-base">Manage your music library</p>
        </div>

        <div className="flex items-center gap-2 mb-4 md:mb-6 border-b border-[#2a2a2a] overflow-x-auto">
          <button
            onClick={() => setActiveTab("songs")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "songs"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#c4c4c4] hover:text-white"
            }`}
          >
            <Music size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Songs</span>
          </button>
          <button
            onClick={() => setActiveTab("artists")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "artists"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#c4c4c4] hover:text-white"
            }`}
          >
            <User size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Artists</span>
          </button>
          <button
            onClick={() => setActiveTab("albums")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "albums"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#c4c4c4] hover:text-white"
            }`}
          >
            <Disc size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Albums</span>
          </button>
          <button
            onClick={() => setActiveTab("playlists")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "playlists"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#c4c4c4] hover:text-white"
            }`}
          >
            <ListMusic size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Playlists</span>
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>

        {renderContent()}
      </div>

      {renderModal()}
    </div>
  );
}

