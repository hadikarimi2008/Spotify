"use server";

import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// Profile Management
export async function updateProfile(userId, data) {
  try {
    const { name, image } = data;
    const updateData = {};

    if (name) updateData.name = name;
    if (image) updateData.image = image;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}

// Profile Picture Upload
export async function uploadProfilePicture(formDataInput, userId) {
  try {
    if (!formDataInput) {
      return { success: false, error: "No form data provided" };
    }

    const file = formDataInput.get("file");

    if (!file || !(file instanceof File)) {
      return { success: false, error: "No file provided or invalid file" };
    }

    // Validate image type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    const isValidImage = validImageTypes.includes(file.type) || 
                         (fileExtension && validImageExtensions.includes(fileExtension));

    if (!isValidImage) {
      return { success: false, error: `Invalid image type. Allowed: ${validImageExtensions.join(", ")}` };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File size too large. Max size: 5MB" };
    }

    if (file.size === 0) {
      return { success: false, error: "File is empty" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "users");

    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (dirError) {
      console.error("Error creating directory:", dirError);
      return { success: false, error: "Failed to create upload directory" };
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${userId}_${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error("Error writing file:", writeError);
      return { success: false, error: `Failed to save file: ${writeError.message}` };
    }

    const fileUrl = `/users/${filename}`;

    // Update user profile
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { image: fileUrl },
      });
    } catch (dbError) {
      console.error("Error updating database:", dbError);
      // Try to delete the uploaded file if database update fails
      try {
        const { unlink } = await import("fs/promises");
        await unlink(filepath);
      } catch (unlinkError) {
        console.error("Error deleting file after DB error:", unlinkError);
      }
      return { success: false, error: "Failed to update profile in database" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, url: fileUrl, filename: filename };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { success: false, error: `Failed to upload: ${error.message || "Unknown error"}` };
  }
}

// Favorite Songs
export async function getFavoriteSongs(userId) {
  try {
    const favorites = await prisma.favoriteSong.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });

    return { success: true, data: favorites.map(f => f.song) };
  } catch (error) {
    console.error("Error fetching favorite songs:", error);
    return { success: false, error: "Failed to fetch favorite songs" };
  }
}

export async function addToFavorites(userId, songId) {
  try {
    const favorite = await prisma.favoriteSong.create({
      data: {
        userId,
        songId,
      },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: favorite.song };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, error: "Song already in favorites" };
    }
    console.error("Error adding to favorites:", error);
    return { success: false, error: "Failed to add to favorites" };
  }
}

export async function removeFromFavorites(userId, songId) {
  try {
    await prisma.favoriteSong.deleteMany({
      where: {
        userId,
        songId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return { success: false, error: "Failed to remove from favorites" };
  }
}

// User Songs (Songs added by user)
export async function getUserSongs(userId) {
  try {
    const userSongs = await prisma.userSong.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });

    return { success: true, data: userSongs.map(us => us.song) };
  } catch (error) {
    console.error("Error fetching user songs:", error);
    return { success: false, error: "Failed to fetch user songs" };
  }
}

export async function addUserSong(userId, songId) {
  try {
    const userSong = await prisma.userSong.create({
      data: {
        userId,
        songId,
      },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: userSong.song };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, error: "Song already added" };
    }
    console.error("Error adding user song:", error);
    return { success: false, error: "Failed to add song" };
  }
}

export async function removeUserSong(userId, songId) {
  try {
    await prisma.userSong.deleteMany({
      where: {
        userId,
        songId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error removing user song:", error);
    return { success: false, error: "Failed to remove song" };
  }
}

export async function deleteAccount(userId, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { success: false, error: "Incorrect password" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

// User Playlists
export async function getUserPlaylists(userId) {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            songs: true,
          },
        },
        songs: {
          take: 1,
          include: {
            song: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: playlists };
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    return { success: false, error: "Failed to fetch playlists" };
  }
}

export async function createUserPlaylist(userId, data) {
  try {
    const { name, description } = data;

    if (!name || name.trim() === "") {
      return { success: false, error: "Playlist name is required" };
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId,
      },
      include: {
        _count: {
          select: {
            songs: true,
          },
        },
      },
    });

    revalidatePath("/");
    return { success: true, data: playlist };
  } catch (error) {
    console.error("Error creating playlist:", error);
    return { success: false, error: "Failed to create playlist" };
  }
}

export async function deleteUserPlaylist(userId, playlistId) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return { success: false, error: "Playlist not found" };
    }

    if (playlist.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.playlist.delete({
      where: { id: playlistId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return { success: false, error: "Failed to delete playlist" };
  }
}

export async function addSongToUserPlaylist(userId, playlistId, songId) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return { success: false, error: "Playlist not found" };
    }

    if (playlist.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, error: "Song already in playlist" };
    }
    console.error("Error adding song to playlist:", error);
    return { success: false, error: "Failed to add song to playlist" };
  }
}

export async function removeSongFromUserPlaylist(userId, playlistId, songId) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return { success: false, error: "Playlist not found" };
    }

    if (playlist.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.playlistSong.deleteMany({
      where: {
        playlistId,
        songId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    return { success: false, error: "Failed to remove song from playlist" };
  }
}

export async function getPlaylistSongs(userId, playlistId) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        songs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
          orderBy: {
            song: {
              playCount: "desc",
            },
          },
        },
      },
    });

    if (!playlist) {
      return { success: false, error: "Playlist not found" };
    }

    if (playlist.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    return { 
      success: true, 
      data: playlist.songs.map(ps => ps.song),
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        imageUrl: playlist.imageUrl,
      }
    };
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    return { success: false, error: "Failed to fetch playlist songs" };
  }
}

// Statistics & Analytics
export async function getUserStatistics(userId) {
  try {
    const [
      totalSongsPlayed,
      totalPlaylists,
      totalFavorites,
      totalUserSongs,
      totalListeningTime,
      recentlyPlayedCount,
    ] = await Promise.all([
      prisma.listeningHistory.count({ where: { userId } }),
      prisma.playlist.count({ where: { userId } }),
      prisma.favoriteSong.count({ where: { userId } }),
      prisma.userSong.count({ where: { userId } }),
      prisma.listeningHistory.aggregate({
        where: { userId },
        _sum: { duration: true },
      }),
      prisma.recentlyPlayed.count({ where: { userId } }),
    ]);

    const totalMinutes = Math.floor((totalListeningTime._sum.duration || 0) / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    return {
      success: true,
      data: {
        totalSongsPlayed,
        totalPlaylists,
        totalFavorites,
        totalUserSongs,
        totalListeningTime: {
          seconds: totalListeningTime._sum.duration || 0,
          minutes: totalMinutes,
          hours: totalHours,
        },
        recentlyPlayedCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

// Listening History
export async function getListeningHistory(userId, limit = 50, offset = 0) {
  try {
    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: {
        playedAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.listeningHistory.count({ where: { userId } });

    return { success: true, data: history, total };
  } catch (error) {
    console.error("Error fetching listening history:", error);
    return { success: false, error: "Failed to fetch listening history" };
  }
}

export async function addToListeningHistory(userId, songId, duration = null) {
  try {
    await prisma.listeningHistory.create({
      data: {
        userId,
        songId,
        duration,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding to listening history:", error);
    return { success: false, error: "Failed to add to history" };
  }
}

// Top Artists & Albums
export async function getUserTopArtists(userId, limit = 10) {
  try {
    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            artist: true,
          },
        },
      },
    });

    const artistCounts = {};
    history.forEach((entry) => {
      const artistId = entry.song.artist.id;
      if (!artistCounts[artistId]) {
        artistCounts[artistId] = {
          artist: entry.song.artist,
          count: 0,
        };
      }
      artistCounts[artistId].count++;
    });

    const topArtists = Object.values(artistCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => ({
        ...item.artist,
        playCount: item.count,
      }));

    return { success: true, data: topArtists };
  } catch (error) {
    console.error("Error fetching top artists:", error);
    return { success: false, error: "Failed to fetch top artists" };
  }
}

export async function getUserTopAlbums(userId, limit = 10) {
  try {
    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            album: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
    });

    const albumCounts = {};
    history.forEach((entry) => {
      if (entry.song.album) {
        const albumId = entry.song.album.id;
        if (!albumCounts[albumId]) {
          albumCounts[albumId] = {
            album: entry.song.album,
            count: 0,
          };
        }
        albumCounts[albumId].count++;
      }
    });

    const topAlbums = Object.values(albumCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => ({
        ...item.album,
        playCount: item.count,
      }));

    return { success: true, data: topAlbums };
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return { success: false, error: "Failed to fetch top albums" };
  }
}

// Privacy Settings
export async function getPrivacySettings(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profilePublic: true,
        statsPublic: true,
        playlistsPublic: true,
        favoritesPublic: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching privacy settings:", error);
    return { success: false, error: "Failed to fetch privacy settings" };
  }
}

export async function updatePrivacySettings(userId, settings) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePublic: settings.profilePublic,
        statsPublic: settings.statsPublic,
        playlistsPublic: settings.playlistsPublic,
        favoritesPublic: settings.favoritesPublic,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return { success: false, error: "Failed to update privacy settings" };
  }
}

// Recommendations
export async function getRecommendations(userId, limit = 20) {
  try {
    const userTopArtists = await getUserTopArtists(userId, 5);
    const userTopGenres = await prisma.listeningHistory.findMany({
      where: { userId },
      include: {
        song: true,
      },
      take: 100,
    });

    const genreCounts = {};
    userTopGenres.forEach((entry) => {
      if (entry.song.genre) {
        genreCounts[entry.song.genre] = (genreCounts[entry.song.genre] || 0) + 1;
      }
    });

    const topGenres = Object.keys(genreCounts)
      .sort((a, b) => genreCounts[b] - genreCounts[a])
      .slice(0, 3);

    const artistIds = userTopArtists.success
      ? userTopArtists.data.map((a) => a.id)
      : [];

    const recommendations = await prisma.song.findMany({
      where: {
        OR: [
          { artistId: { in: artistIds } },
          { genre: { in: topGenres } },
        ],
      },
      include: {
        artist: true,
        album: true,
      },
      take: limit,
      orderBy: {
        playCount: "desc",
      },
    });

    return { success: true, data: recommendations };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return { success: false, error: "Failed to fetch recommendations" };
  }
}

// Downloads & Offline
export async function getUserDownloads(userId) {
  try {
    const downloads = await prisma.userDownload.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: {
        downloadedAt: "desc",
      },
    });

    return { success: true, data: downloads.map((d) => d.song) };
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return { success: false, error: "Failed to fetch downloads" };
  }
}

export async function addDownload(userId, songId) {
  try {
    const download = await prisma.userDownload.create({
      data: {
        userId,
        songId,
      },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: download.song };
  } catch (error) {
    if (error.code === "P2002") {
      return { success: false, error: "Song already downloaded" };
    }
    console.error("Error adding download:", error);
    return { success: false, error: "Failed to add download" };
  }
}

export async function removeDownload(userId, songId) {
  try {
    await prisma.userDownload.deleteMany({
      where: {
        userId,
        songId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error removing download:", error);
    return { success: false, error: "Failed to remove download" };
  }
}

// Year in Review
export async function getYearInReview(userId, year = new Date().getFullYear()) {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const [
      totalPlays,
      topSongs,
      topArtists,
      topAlbums,
      totalTime,
    ] = await Promise.all([
      prisma.listeningHistory.count({
        where: {
          userId,
          playedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.listeningHistory.groupBy({
        by: ["songId"],
        where: {
          userId,
          playedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _count: {
          songId: true,
        },
        orderBy: {
          _count: {
            songId: "desc",
          },
        },
        take: 10,
      }),
      prisma.listeningHistory.findMany({
        where: {
          userId,
          playedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          song: {
            include: {
              artist: true,
            },
          },
        },
        take: 1000,
      }),
      prisma.listeningHistory.findMany({
        where: {
          userId,
          playedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          song: {
            include: {
              album: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
        take: 1000,
      }),
      prisma.listeningHistory.aggregate({
        where: {
          userId,
          playedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          duration: true,
        },
      }),
    ]);

    const artistCounts = {};
    topArtists.forEach((entry) => {
      const artistId = entry.song.artist.id;
      artistCounts[artistId] = (artistCounts[artistId] || 0) + 1;
    });

    const albumCounts = {};
    topAlbums.forEach((entry) => {
      if (entry.song.album) {
        const albumId = entry.song.album.id;
        albumCounts[albumId] = (albumCounts[albumId] || 0) + 1;
      }
    });

    const topArtistsList = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([artistId]) => {
        const entry = topArtists.find((e) => e.song.artist.id === artistId);
        return entry.song.artist;
      });

    const topAlbumsList = Object.entries(albumCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([albumId]) => {
        const entry = topAlbums.find((e) => e.song.album?.id === albumId);
        return entry?.song.album;
      })
      .filter(Boolean);

    const topSongsData = await Promise.all(
      topSongs.map(async (item) => {
        const song = await prisma.song.findUnique({
          where: { id: item.songId },
          include: {
            artist: true,
            album: true,
          },
        });
        return { ...song, playCount: item._count.songId };
      })
    );

    const totalMinutes = Math.floor((totalTime._sum.duration || 0) / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    return {
      success: true,
      data: {
        year,
        totalPlays,
        totalTime: {
          seconds: totalTime._sum.duration || 0,
          minutes: totalMinutes,
          hours: totalHours,
        },
        topSongs: topSongsData,
        topArtists: topArtistsList,
        topAlbums: topAlbumsList,
      },
    };
  } catch (error) {
    console.error("Error fetching year in review:", error);
    return { success: false, error: "Failed to fetch year in review" };
  }
}
