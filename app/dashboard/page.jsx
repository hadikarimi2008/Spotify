"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Heart,
  Music,
  Settings,
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  Upload,
  BarChart3,
  History,
  ListMusic,
  TrendingUp,
  Lock,
  Lightbulb,
  Download,
  Calendar,
} from "lucide-react";
import {
  updateProfile,
  changePassword,
  uploadProfilePicture,
  getFavoriteSongs,
  addToFavorites,
  removeFromFavorites,
  getUserSongs,
  addUserSong,
  removeUserSong,
  deleteAccount,
  getUserStatistics,
  getListeningHistory,
  getUserPlaylists,
  getUserTopArtists,
  getUserTopAlbums,
  getPrivacySettings,
  updatePrivacySettings,
  getRecommendations,
  getUserDownloads,
  addDownload,
  removeDownload,
  getYearInReview,
} from "./actions";
import { getSongs } from "@/app/actions";
import Image from "next/image";

export default function UserDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    image: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Favorites state
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  // User songs state
  const [userSongs, setUserSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // New features state
  const [statistics, setStatistics] = useState(null);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    statsPublic: true,
    playlistsPublic: true,
    favoritesPublic: true,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [yearInReview, setYearInReview] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user) {
      loadData();
    }
  }, [session, status, router]);

  const loadData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Load profile
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });

      // Load favorites
      const favoritesResult = await getFavoriteSongs(session.user.id);
      if (favoritesResult.success) {
        setFavoriteSongs(favoritesResult.data);
      }

      // Load user songs
      const userSongsResult = await getUserSongs(session.user.id);
      if (userSongsResult.success) {
        setUserSongs(userSongsResult.data);
      }

      // Load all songs for adding
      const allSongsData = await getSongs(100);
      setAllSongs(allSongsData);

      // Load new features data
      const [statsResult, historyResult, playlistsResult, topArtistsResult, topAlbumsResult, privacyResult, recommendationsResult, downloadsResult, yearReviewResult] = await Promise.all([
        getUserStatistics(session.user.id),
        getListeningHistory(session.user.id, 50),
        getUserPlaylists(session.user.id),
        getUserTopArtists(session.user.id, 10),
        getUserTopAlbums(session.user.id, 10),
        getPrivacySettings(session.user.id),
        getRecommendations(session.user.id, 20),
        getUserDownloads(session.user.id),
        getYearInReview(session.user.id),
      ]);

      if (statsResult.success) setStatistics(statsResult.data);
      if (historyResult.success) setListeningHistory(historyResult.data);
      if (playlistsResult.success) setPlaylists(playlistsResult.data);
      if (topArtistsResult.success) setTopArtists(topArtistsResult.data);
      if (topAlbumsResult.success) setTopAlbums(topAlbumsResult.data);
      if (privacyResult.success) setPrivacySettings(privacyResult.data);
      if (recommendationsResult.success) setRecommendations(recommendationsResult.data);
      if (downloadsResult.success) setDownloads(downloadsResult.data);
      if (yearReviewResult.success) setYearInReview(yearReviewResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile(session.user.id, {
        name: profileData.name,
        image: profileData.image,
      });

      if (result.success) {
        setSuccess("Profile updated successfully!");
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await changePassword(
        session.user.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setSuccess("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!session?.user?.id || !file) {
      setError("Please select a file");
      return;
    }

    // Client-side validation
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      setError("Invalid image type. Please use JPEG, PNG, GIF, or WebP");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size too large. Maximum size is 5MB");
      return;
    }

    setUploadingImage(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProfilePicture(formData, session.user.id);

      if (result.success) {
        setProfileData({ ...profileData, image: result.url });
        setSuccess("Profile picture updated successfully!");
        
        // Update NextAuth session
        if (update) {
          await update({
            name: profileData.name,
            image: result.url,
          });
        }
        
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    if (!deletePassword) {
      setError("Please enter your password to confirm");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await deleteAccount(session.user.id, deletePassword);

      if (result.success) {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: true, callbackUrl: "/" });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (songId) => {
    if (!session?.user?.id) return;

    try {
      const result = await addToFavorites(session.user.id, songId);
      if (result.success) {
        setFavoriteSongs([...favoriteSongs, result.data]);
        setSuccess("Added to favorites!");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to add to favorites");
    }
  };

  const handleRemoveFavorite = async (songId) => {
    if (!session?.user?.id) return;

    try {
      const result = await removeFromFavorites(session.user.id, songId);
      if (result.success) {
        setFavoriteSongs(favoriteSongs.filter(s => s.id !== songId));
        setSuccess("Removed from favorites!");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to remove from favorites");
    }
  };

  const handleAddUserSong = async (songId) => {
    if (!session?.user?.id) return;

    try {
      const result = await addUserSong(session.user.id, songId);
      if (result.success) {
        setUserSongs([...userSongs, result.data]);
        setShowAddSongModal(false);
        setSuccess("Song added to your library!");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to add song");
    }
  };

  const handleRemoveUserSong = async (songId) => {
    if (!session?.user?.id) return;

    try {
      const result = await removeUserSong(session.user.id, songId);
      if (result.success) {
        setUserSongs(userSongs.filter(s => s.id !== songId));
        setSuccess("Song removed from your library!");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to remove song");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-[#b3b3b3] text-sm md:text-base">Manage your profile and music library</p>
        </div>

        <div className="flex items-center gap-2 mb-4 md:mb-6 border-b border-[#2a2a2a] overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "profile"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <User size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "favorites"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Heart size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Favorites</span>
          </button>
          <button
            onClick={() => setActiveTab("my-songs")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "my-songs"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Music size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">My Songs</span>
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "statistics"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <BarChart3 size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Statistics</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "history"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <History size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">History</span>
          </button>
          <button
            onClick={() => setActiveTab("playlists")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "playlists"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <ListMusic size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Playlists</span>
          </button>
          <button
            onClick={() => setActiveTab("top-artists")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "top-artists"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <TrendingUp size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Top Artists</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "privacy"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Lock size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "recommendations"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Lightbulb size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "downloads"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Download size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Downloads</span>
          </button>
          <button
            onClick={() => setActiveTab("year-review")}
            className={`px-3 md:px-6 py-2 md:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "year-review"
                ? "border-[#1DB954] text-white"
                : "border-transparent text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Calendar size={18} className="md:size-[20px] inline mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Year in Review</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-[#121212] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profileData.image ? (
                      <Image
                        src={profileData.image}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-[120px] h-[120px] rounded-full bg-[#1DB954] flex items-center justify-center">
                        <User size={60} color="white" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-[#1DB954] p-2 rounded-full cursor-pointer hover:bg-[#1ed760] transition-colors">
                      <Upload size={20} color="white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#b3b3b3] text-sm mb-2">Profile Picture</p>
                    {uploadingImage && (
                      <p className="text-[#b3b3b3] text-xs">Uploading...</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[#b3b3b3] text-xs mt-1">Email cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </form>
            </div>

            <div className="bg-[#121212] rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Password
                </button>
              </form>
            </div>

            <div className="bg-[#121212] rounded-lg p-6 border border-red-500/30">
              <h2 className="text-2xl font-bold mb-4 text-red-400">Danger Zone</h2>
              <p className="text-[#b3b3b3] text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setShowDeleteAccountModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Favorite Songs</h2>
            </div>

            {favoriteSongs.length === 0 ? (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <Heart size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No favorite songs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favoriteSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors"
                  >
                    <div className="w-10 text-[#b3b3b3] text-sm font-medium">{index + 1}</div>
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                      {song.imageUrl && (
                        <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{song.title}</h4>
                      <p className="text-[#b3b3b3] text-sm truncate">
                        {song.artist?.name || "Unknown"} {song.album && `• ${song.album.title}`}
                      </p>
                    </div>
                    <div className="text-[#b3b3b3] text-sm">{formatDuration(song.duration)}</div>
                    <button
                      onClick={() => handleRemoveFavorite(song.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "my-songs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Songs</h2>
              <button
                onClick={() => setShowAddSongModal(true)}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Song
              </button>
            </div>

            {userSongs.length === 0 ? (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <Music size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No songs in your library yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors"
                  >
                    <div className="w-10 text-[#b3b3b3] text-sm font-medium">{index + 1}</div>
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                      {song.imageUrl && (
                        <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{song.title}</h4>
                      <p className="text-[#b3b3b3] text-sm truncate">
                        {song.artist?.name || "Unknown"} {song.album && `• ${song.album.title}`}
                      </p>
                    </div>
                    <div className="text-[#b3b3b3] text-sm">{formatDuration(song.duration)}</div>
                    <button
                      onClick={async () => {
                        if (!session?.user?.id) return;
                        const { addDownload } = await import("./actions");
                        const result = await addDownload(session.user.id, song.id);
                        if (result.success) {
                          setSuccess("Song downloaded!");
                        } else {
                          setError(result.error);
                        }
                      }}
                      className="p-2 text-[#1DB954] hover:text-[#1ed760] transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleRemoveUserSong(song.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Song Modal */}
        {showAddSongModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121212] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#121212] border-b border-[#2a2a2a] p-6 flex items-center justify-between">
                <h2 className="text-white text-2xl font-bold">Add Song to Library</h2>
                <button
                  onClick={() => setShowAddSongModal(false)}
                  className="text-[#b3b3b3] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {allSongs
                    .filter(song => !userSongs.some(us => us.id === song.id))
                    .map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors cursor-pointer"
                        onClick={() => handleAddUserSong(song.id)}
                      >
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                          {song.imageUrl && (
                            <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{song.title}</h4>
                          <p className="text-[#b3b3b3] text-sm truncate">
                            {song.artist?.name || "Unknown"}
                          </p>
                        </div>
                        <button className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                          Add
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121212] rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-white text-2xl font-bold mb-4">Delete Account</h2>
                <p className="text-[#b3b3b3] mb-6">
                  This action cannot be undone. Please enter your password to confirm.
                </p>
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                      className="w-full bg-[#242424] text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-white focus:bg-[#2a2a2a] transition-all"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteAccountModal(false);
                        setDeletePassword("");
                      }}
                      className="flex-1 bg-[#242424] hover:bg-[#2a2a2a] text-white font-bold px-6 py-3 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Statistics</h2>
            {statistics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#121212] rounded-lg p-6">
                  <h3 className="text-[#b3b3b3] text-sm mb-2">Total Songs Played</h3>
                  <p className="text-3xl font-bold text-white">{statistics.totalSongsPlayed}</p>
                </div>
                <div className="bg-[#121212] rounded-lg p-6">
                  <h3 className="text-[#b3b3b3] text-sm mb-2">Total Playlists</h3>
                  <p className="text-3xl font-bold text-white">{statistics.totalPlaylists}</p>
                </div>
                <div className="bg-[#121212] rounded-lg p-6">
                  <h3 className="text-[#b3b3b3] text-sm mb-2">Favorite Songs</h3>
                  <p className="text-3xl font-bold text-white">{statistics.totalFavorites}</p>
                </div>
                <div className="bg-[#121212] rounded-lg p-6">
                  <h3 className="text-[#b3b3b3] text-sm mb-2">My Songs</h3>
                  <p className="text-3xl font-bold text-white">{statistics.totalUserSongs}</p>
                </div>
                <div className="bg-[#121212] rounded-lg p-6">
                  <h3 className="text-[#b3b3b3] text-sm mb-2">Listening Time</h3>
                  <p className="text-3xl font-bold text-white">{statistics.totalListeningTime.hours}h</p>
                  <p className="text-sm text-[#b3b3b3]">{statistics.totalListeningTime.minutes} minutes</p>
                </div>
                <div className="bg-[#121212] rounded-lg p-6">
                  <h3 className="text-[#b3b3b3] text-sm mb-2">Recently Played</h3>
                  <p className="text-3xl font-bold text-white">{statistics.recentlyPlayedCount}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <BarChart3 size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No statistics available yet</p>
              </div>
            )}
          </div>
        )}

        {/* Listening History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Listening History</h2>
            {listeningHistory.length > 0 ? (
              <div className="space-y-2">
                {listeningHistory.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors"
                  >
                    <div className="w-10 text-[#b3b3b3] text-sm font-medium">{index + 1}</div>
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                      {entry.song.imageUrl && (
                        <img src={entry.song.imageUrl} alt={entry.song.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{entry.song.title}</h4>
                      <p className="text-[#b3b3b3] text-sm truncate">
                        {entry.song.artist?.name || "Unknown"} • {new Date(entry.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-[#b3b3b3] text-sm">{formatDuration(entry.song.duration)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <History size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No listening history yet</p>
              </div>
            )}
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === "playlists" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Playlists</h2>
            </div>
            {playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#242424] transition-colors cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 mb-4">
                      {playlist.songs?.[0]?.song?.imageUrl ? (
                        <img src={playlist.songs[0].song.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ListMusic size={48} className="text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-medium truncate mb-1">{playlist.name}</h3>
                    <p className="text-[#b3b3b3] text-sm">{playlist._count?.songs || 0} songs</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <ListMusic size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No playlists yet</p>
              </div>
            )}
          </div>
        )}

        {/* Top Artists Tab */}
        {activeTab === "top-artists" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Top Artists</h2>
            {topArtists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {topArtists.map((artist, index) => (
                  <div key={artist.id} className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#242424] transition-colors text-center">
                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[#333] mb-3">
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={32} className="text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-medium truncate text-sm mb-1">{artist.name}</h3>
                    <p className="text-[#b3b3b3] text-xs">{artist.playCount} plays</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <TrendingUp size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No top artists yet</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Top Albums</h2>
              {topAlbums.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {topAlbums.map((album) => (
                    <div key={album.id} className="bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#242424] transition-colors">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#333] mb-3">
                        {album.imageUrl ? (
                          <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music size={32} className="text-white opacity-50" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-medium truncate text-sm mb-1">{album.title}</h3>
                      <p className="text-[#b3b3b3] text-xs truncate">{album.artist?.name}</p>
                      <p className="text-[#b3b3b3] text-xs mt-1">{album.playCount} plays</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#121212] rounded-lg">
                  <p className="text-[#b3b3b3]">No top albums yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy Settings Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Privacy Settings</h2>
            <div className="bg-[#121212] rounded-lg p-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!session?.user?.id) return;
                  const result = await updatePrivacySettings(session.user.id, privacySettings);
                  if (result.success) {
                    setSuccess("Privacy settings updated!");
                  } else {
                    setError(result.error);
                  }
                }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Public Profile</h3>
                    <p className="text-[#b3b3b3] text-sm">Allow others to see your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.profilePublic}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, profilePublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Public Statistics</h3>
                    <p className="text-[#b3b3b3] text-sm">Allow others to see your listening statistics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.statsPublic}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, statsPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Public Playlists</h3>
                    <p className="text-[#b3b3b3] text-sm">Allow others to see your playlists</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.playlistsPublic}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, playlistsPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Public Favorites</h3>
                    <p className="text-[#b3b3b3] text-sm">Allow others to see your favorite songs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.favoritesPublic}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, favoritesPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors"
                >
                  Save Privacy Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors cursor-pointer"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.playSong) {
                        window.playSong(song);
                      }
                    }}
                  >
                    <div className="w-10 text-[#b3b3b3] text-sm font-medium">{index + 1}</div>
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                      {song.imageUrl && (
                        <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{song.title}</h4>
                      <p className="text-[#b3b3b3] text-sm truncate">
                        {song.artist?.name || "Unknown"} {song.album && `• ${song.album.title}`}
                      </p>
                    </div>
                    <div className="text-[#b3b3b3] text-sm">{formatDuration(song.duration)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <Lightbulb size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No recommendations available yet. Start listening to get personalized recommendations!</p>
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Downloaded Songs</h2>
            </div>
            {downloads.length > 0 ? (
              <div className="space-y-2">
                {downloads.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors"
                  >
                    <div className="w-10 text-[#b3b3b3] text-sm font-medium">{index + 1}</div>
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                      {song.imageUrl && (
                        <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{song.title}</h4>
                      <p className="text-[#b3b3b3] text-sm truncate">
                        {song.artist?.name || "Unknown"} {song.album && `• ${song.album.title}`}
                      </p>
                    </div>
                    <div className="text-[#b3b3b3] text-sm">{formatDuration(song.duration)}</div>
                    <button
                      onClick={async () => {
                        if (!session?.user?.id) return;
                        const result = await removeDownload(session.user.id, song.id);
                        if (result.success) {
                          setDownloads(downloads.filter((s) => s.id !== song.id));
                          setSuccess("Download removed!");
                        } else {
                          setError(result.error);
                        }
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <Download size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3] mb-4">No downloaded songs yet</p>
                <button
                  onClick={() => setActiveTab("my-songs")}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors"
                >
                  Browse Songs
                </button>
              </div>
            )}
          </div>
        )}

        {/* Year in Review Tab */}
        {activeTab === "year-review" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your {yearInReview?.year || new Date().getFullYear()} in Review</h2>
            {yearInReview ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#121212] rounded-lg p-6">
                    <h3 className="text-[#b3b3b3] text-sm mb-2">Total Plays</h3>
                    <p className="text-3xl font-bold text-white">{yearInReview.totalPlays}</p>
                  </div>
                  <div className="bg-[#121212] rounded-lg p-6">
                    <h3 className="text-[#b3b3b3] text-sm mb-2">Listening Time</h3>
                    <p className="text-3xl font-bold text-white">{yearInReview.totalTime.hours}h</p>
                    <p className="text-sm text-[#b3b3b3]">{yearInReview.totalTime.minutes} minutes</p>
                  </div>
                  <div className="bg-[#121212] rounded-lg p-6">
                    <h3 className="text-[#b3b3b3] text-sm mb-2">Year</h3>
                    <p className="text-3xl font-bold text-white">{yearInReview.year}</p>
                  </div>
                </div>

                {yearInReview.topSongs.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Top Songs</h3>
                    <div className="space-y-2">
                      {yearInReview.topSongs.slice(0, 10).map((song, index) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-md hover:bg-[#242424] transition-colors"
                        >
                          <div className="w-10 text-[#b3b3b3] text-sm font-medium">{index + 1}</div>
                          <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gradient-to-br from-purple-700 to-blue-900 shrink-0">
                            {song.imageUrl && (
                              <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{song.title}</h4>
                            <p className="text-[#b3b3b3] text-sm truncate">
                              {song.artist?.name || "Unknown"} • {song.playCount} plays
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {yearInReview.topArtists.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Top Artists</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {yearInReview.topArtists.map((artist) => (
                        <div key={artist.id} className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                          <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[#333] mb-3 mx-auto">
                            {artist.imageUrl ? (
                              <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User size={32} className="text-white opacity-50" />
                              </div>
                            )}
                          </div>
                          <h4 className="text-white font-medium truncate text-sm">{artist.name}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {yearInReview.topAlbums.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Top Albums</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {yearInReview.topAlbums.map((album) => (
                        <div key={album.id} className="bg-[#1a1a1a] rounded-lg p-4">
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#333] mb-3">
                            {album.imageUrl ? (
                              <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music size={32} className="text-white opacity-50" />
                              </div>
                            )}
                          </div>
                          <h4 className="text-white font-medium truncate text-sm mb-1">{album.title}</h4>
                          <p className="text-[#b3b3b3] text-xs truncate">{album.artist?.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121212] rounded-lg">
                <Calendar size={48} className="mx-auto mb-4 text-[#b3b3b3]" />
                <p className="text-[#b3b3b3]">No data available for this year yet. Start listening to build your year in review!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


