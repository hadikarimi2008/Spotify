"use server";

import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { revalidatePath } from "next/cache";

// File Upload Action
export async function uploadFile(formDataInput) {
  try {
    const file = formDataInput.get("file");
    const type = formDataInput.get("type"); // "image" or "audio"

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!type || (type !== "image" && type !== "audio")) {
      return { success: false, error: "Type must be 'image' or 'audio'" };
    }

    // Validate file type (more flexible - check extension if MIME type is not available)
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const validImageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const validAudioExtensions = ["mp3", "wav", "ogg", "m4a", "aac", "flac", "mp4", "wma"];
    
    if (type === "image") {
      const isValidImageType = validImageTypes.includes(file.type) || 
                               (file.type === "" && validImageExtensions.includes(fileExtension));
      if (!isValidImageType) {
        return { success: false, error: `Invalid image type. Allowed: ${validImageExtensions.join(", ")}` };
      }
    }
    
    if (type === "audio") {
      // More lenient for audio files - accept any audio/* MIME type or valid extension
      const isValidAudioType = file.type.startsWith("audio/") || 
                               file.type === "application/octet-stream" ||
                               (fileExtension && validAudioExtensions.includes(fileExtension));
      
      if (!isValidAudioType) {
        console.warn(`Audio file type check: type=${file.type}, extension=${fileExtension}`);
        // Don't block if extension is valid even if MIME type is unknown
        if (!fileExtension || !validAudioExtensions.includes(fileExtension)) {
          return { success: false, error: `Invalid audio type. Allowed extensions: ${validAudioExtensions.join(", ")}` };
        }
      }
    }

    // Check file size (max 50MB for audio, 10MB for images)
    const maxSize = type === "audio" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return { 
        success: false, 
        error: `File size too large (${fileSizeMB}MB). Max size: ${type === "audio" ? "50MB" : "10MB"}` 
      };
    }

    // Read file in chunks for large files
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder = type === "image" ? "images" : "files";
    const uploadDir = join(process.cwd(), "public", "songs", folder);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    const fileUrl = `/songs/${folder}/${filename}`;

    return { success: true, url: fileUrl, filename: filename };
  } catch (error) {
    console.error("Error uploading file:", error);
    
    // More detailed error messages
    if (error.code === "ENOENT") {
      return { success: false, error: "Directory not found. Please check file permissions." };
    }
    if (error.code === "EACCES") {
      return { success: false, error: "Permission denied. Please check file permissions." };
    }
    if (error.code === "ENOSPC") {
      return { success: false, error: "No space left on device." };
    }
    
    return { success: false, error: `Failed to upload file: ${error.message || "Unknown error"}` };
  }
}

// Songs Actions
export async function getSongs(artistId = null, albumId = null) {
  try {
    const where = {};
    if (artistId) where.artistId = artistId;
    if (albumId) where.albumId = albumId;

    const songs = await prisma.song.findMany({
      where,
      include: {
        artist: true,
        album: true,
      },
      orderBy: {
        playCount: "desc",
      },
    });

    return { success: true, data: songs };
  } catch (error) {
    console.error("Error fetching songs:", error);
    return { success: false, error: "Failed to fetch songs" };
  }
}

export async function getSong(id) {
  try {
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
      },
    });

    if (!song) {
      return { success: false, error: "Song not found" };
    }

    return { success: true, data: song };
  } catch (error) {
    console.error("Error fetching song:", error);
    return { success: false, error: "Failed to fetch song" };
  }
}

// Helper function to find or create artist by name
async function findOrCreateArtist(artistName) {
  if (!artistName || artistName.trim() === "") {
    return null;
  }

  let artist = await prisma.artist.findUnique({
    where: { name: artistName.trim() },
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: artistName.trim(),
      },
    });
  }

  return artist.id;
}

// Helper function to find or create album by name and artist
async function findOrCreateAlbum(albumName, artistId, releaseYear) {
  if (!albumName || albumName.trim() === "" || !artistId) {
    return null;
  }

  let album = await prisma.album.findFirst({
    where: {
      title: albumName.trim(),
      artistId: artistId,
    },
  });

  if (!album) {
    album = await prisma.album.create({
      data: {
        title: albumName.trim(),
        artistId: artistId,
        releaseYear: releaseYear ? parseInt(releaseYear) : new Date().getFullYear(),
      },
    });
  }

  return album.id;
}

export async function createSong(data) {
  try {
    const { title, duration, songUrl, imageUrl, artistName, albumName, releaseYear, genre } = data;

    if (!title || !duration || !songUrl || !imageUrl || !artistName) {
      return { success: false, error: "Missing required fields" };
    }

    // Find or create artist
    const artistId = await findOrCreateArtist(artistName);
    if (!artistId) {
      return { success: false, error: "Failed to create or find artist" };
    }

    // Find or create album if provided
    let albumId = null;
    if (albumName && albumName.trim() !== "") {
      albumId = await findOrCreateAlbum(albumName, artistId, releaseYear);
    }

    const song = await prisma.song.create({
      data: {
        title,
        duration: parseInt(duration),
        songUrl,
        imageUrl,
        artistId,
        albumId: albumId || null,
        genre: genre || null,
      },
      include: {
        artist: true,
        album: true,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: song };
  } catch (error) {
    console.error("Error creating song:", error);
    return { success: false, error: "Failed to create song" };
  }
}

export async function updateSong(id, data) {
  try {
    const { artistName, albumName, releaseYear, songUrl, imageUrl, ...restData } = data;
    
    // Fetch the existing song to compare file URLs
    const existingSong = await prisma.song.findUnique({ where: { id } });
    
    if (!existingSong) {
      return { success: false, error: "Song not found" };
    }

    let updateData = {};

    // Update title if changed
    if (restData.title && restData.title !== existingSong.title) {
      updateData.title = restData.title;
    }

    // Update duration if changed
    if (data.duration) {
      const newDuration = parseInt(data.duration);
      if (newDuration !== existingSong.duration) {
        updateData.duration = newDuration;
      }
    }

    // Update genre if changed
    if (restData.genre !== undefined && restData.genre !== existingSong.genre) {
      updateData.genre = restData.genre || null;
    }

    // Only update songUrl if a new file is provided and it's different
    if (songUrl && songUrl !== existingSong.songUrl) {
      updateData.songUrl = songUrl;
    }

    // Only update imageUrl if a new file is provided and it's different
    if (imageUrl && imageUrl !== existingSong.imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // If artist name is provided, find or create artist
    if (artistName) {
      const artistId = await findOrCreateArtist(artistName);
      if (artistId && artistId !== existingSong.artistId) {
        updateData.artistId = artistId;
      }
    }

    // If album name is provided, find or create album
    if (albumName && (updateData.artistId || existingSong.artistId)) {
      const albumId = await findOrCreateAlbum(albumName, updateData.artistId || existingSong.artistId, releaseYear);
      if (albumId && albumId !== existingSong.albumId) {
        updateData.albumId = albumId;
      }
    }

    // If no changes, return success without updating
    if (Object.keys(updateData).length === 0) {
      return { success: true, data: existingSong };
    }

    const song = await prisma.song.update({
      where: { id },
      data: updateData,
      include: {
        artist: true,
        album: true,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: song };
  } catch (error) {
    console.error("Error updating song:", error);
    return { success: false, error: error.message || "Failed to update song" };
  }
}

export async function deleteSong(id) {
  try {
    await prisma.song.delete({
      where: { id },
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting song:", error);
    return { success: false, error: "Failed to delete song" };
  }
}

// Artists Actions
export async function getArtists() {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: artists };
  } catch (error) {
    console.error("Error fetching artists:", error);
    return { success: false, error: "Failed to fetch artists" };
  }
}

export async function getArtist(id) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            album: true,
          },
          orderBy: {
            playCount: "desc",
          },
        },
        albums: {
          orderBy: {
            releaseYear: "desc",
          },
        },
      },
    });

    if (!artist) {
      return { success: false, error: "Artist not found" };
    }

    return { success: true, data: artist };
  } catch (error) {
    console.error("Error fetching artist:", error);
    return { success: false, error: "Failed to fetch artist" };
  }
}

export async function createArtist(data) {
  try {
    const { name, imageUrl, bio, verified } = data;

    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        imageUrl: imageUrl || null,
        bio: bio || null,
        verified: verified || false,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: artist };
  } catch (error) {
    console.error("Error creating artist:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Artist name already exists" };
    }
    return { success: false, error: "Failed to create artist" };
  }
}

export async function updateArtist(id, data) {
  try {
    const { imageUrl, ...restData } = data;
    
    // Fetch the existing artist to compare
    const existingArtist = await prisma.artist.findUnique({ where: { id } });
    
    if (!existingArtist) {
      return { success: false, error: "Artist not found" };
    }

    let updateData = {};

    // Update name if changed
    if (restData.name && restData.name !== existingArtist.name) {
      updateData.name = restData.name;
    }

    // Update bio if changed
    if (restData.bio !== undefined && restData.bio !== existingArtist.bio) {
      updateData.bio = restData.bio || null;
    }

    // Update verified if changed
    if (restData.verified !== undefined && restData.verified !== existingArtist.verified) {
      updateData.verified = restData.verified;
    }

    // Only update imageUrl if a new file is provided and it's different
    if (imageUrl && imageUrl !== existingArtist.imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // If no changes, return success without updating
    if (Object.keys(updateData).length === 0) {
      return { success: true, data: existingArtist };
    }

    const artist = await prisma.artist.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: artist };
  } catch (error) {
    console.error("Error updating artist:", error);
    return { success: false, error: error.message || "Failed to update artist" };
  }
}

export async function deleteArtist(id) {
  try {
    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        songs: true,
        albums: true,
      },
    });

    if (!artist) {
      return { success: false, error: "Artist not found" };
    }

    // Delete all albums first (songs will be deleted automatically via cascade)
    if (artist.albums.length > 0) {
      await prisma.album.deleteMany({
        where: { artistId: id },
      });
    }

    // Delete all songs (if any remain)
    if (artist.songs.length > 0) {
      await prisma.song.deleteMany({
        where: { artistId: id },
      });
    }

    // Now delete the artist
    await prisma.artist.delete({
      where: { id },
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting artist:", error);
    
    // Handle Prisma foreign key constraint errors
    if (error.code === "P2003") {
      return { success: false, error: "Cannot delete artist. This artist is being used by songs or albums." };
    }
    
    return { success: false, error: error.message || "Failed to delete artist" };
  }
}

// Albums Actions
export async function getAlbums(artistId = null) {
  try {
    const where = {};
    if (artistId) where.artistId = artistId;

    const albums = await prisma.album.findMany({
      where,
      include: {
        artist: true,
        _count: {
          select: {
            songs: true,
          },
        },
      },
      orderBy: {
        releaseYear: "desc",
      },
    });

    return { success: true, data: albums };
  } catch (error) {
    console.error("Error fetching albums:", error);
    return { success: false, error: "Failed to fetch albums" };
  }
}

export async function getAlbum(id) {
  try {
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        songs: {
          orderBy: {
            releaseDate: "asc",
          },
        },
      },
    });

    if (!album) {
      return { success: false, error: "Album not found" };
    }

    return { success: true, data: album };
  } catch (error) {
    console.error("Error fetching album:", error);
    return { success: false, error: "Failed to fetch album" };
  }
}

export async function createAlbum(data) {
  try {
    const { title, imageUrl, releaseYear, artistName } = data;

    if (!title || !releaseYear || !artistName) {
      return { success: false, error: "Missing required fields" };
    }

    // Find or create artist
    const artistId = await findOrCreateArtist(artistName);
    if (!artistId) {
      return { success: false, error: "Failed to create or find artist" };
    }

    const album = await prisma.album.create({
      data: {
        title,
        imageUrl: imageUrl || null,
        releaseYear: parseInt(releaseYear),
        artistId,
      },
      include: {
        artist: true,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: album };
  } catch (error) {
    console.error("Error creating album:", error);
    return { success: false, error: "Failed to create album" };
  }
}

export async function updateAlbum(id, data) {
  try {
    const { artistName, imageUrl, releaseYear, ...restData } = data;
    
    // Fetch the existing album to compare
    const existingAlbum = await prisma.album.findUnique({ where: { id } });
    
    if (!existingAlbum) {
      return { success: false, error: "Album not found" };
    }

    let updateData = {};

    // Update title if changed
    if (restData.title && restData.title !== existingAlbum.title) {
      updateData.title = restData.title;
    }

    // Update releaseYear if changed
    if (releaseYear) {
      const newReleaseYear = parseInt(releaseYear);
      if (newReleaseYear !== existingAlbum.releaseYear) {
        updateData.releaseYear = newReleaseYear;
      }
    }

    // Only update imageUrl if a new file is provided and it's different
    if (imageUrl && imageUrl !== existingAlbum.imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // If artist name is provided, find or create artist
    if (artistName) {
      const artistId = await findOrCreateArtist(artistName);
      if (artistId && artistId !== existingAlbum.artistId) {
        updateData.artistId = artistId;
      }
    }

    // If no changes, return success without updating
    if (Object.keys(updateData).length === 0) {
      return { success: true, data: existingAlbum };
    }

    const album = await prisma.album.update({
      where: { id },
      data: updateData,
      include: {
        artist: true,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: album };
  } catch (error) {
    console.error("Error updating album:", error);
    return { success: false, error: error.message || "Failed to update album" };
  }
}

export async function deleteAlbum(id) {
  try {
    await prisma.album.delete({
      where: { id },
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting album:", error);
    return { success: false, error: "Failed to delete album" };
  }
}

// Playlists Actions
export async function getPlaylists() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        _count: {
          select: {
            songs: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: playlists };
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return { success: false, error: "Failed to fetch playlists" };
  }
}

export async function getPlaylist(id) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
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
        },
      },
    });

    if (!playlist) {
      return { success: false, error: "Playlist not found" };
    }

    return { success: true, data: playlist };
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return { success: false, error: "Failed to fetch playlist" };
  }
}

export async function createPlaylist(data) {
  try {
    const { name, description, imageUrl } = data;

    if (!name) {
      return { success: false, error: "Name is required" };
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: playlist };
  } catch (error) {
    console.error("Error creating playlist:", error);
    return { success: false, error: "Failed to create playlist" };
  }
}

export async function updatePlaylist(id, data) {
  try {
    const playlist = await prisma.playlist.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/dashboard");
    return { success: true, data: playlist };
  } catch (error) {
    console.error("Error updating playlist:", error);
    return { success: false, error: "Failed to update playlist" };
  }
}

export async function deletePlaylist(id) {
  try {
    await prisma.playlist.delete({
      where: { id },
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return { success: false, error: "Failed to delete playlist" };
  }
}

// Playlist Songs Actions
export async function addSongToPlaylist(playlistId, songId) {
  try {
    if (!songId) {
      return { success: false, error: "Song ID is required" };
    }

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
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

    revalidatePath("/admin/dashboard");
    return { success: true, data: playlistSong };
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Song already in playlist" };
    }
    return { success: false, error: "Failed to add song to playlist" };
  }
}

export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    if (!songId) {
      return { success: false, error: "Song ID is required" };
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    return { success: false, error: "Failed to remove song from playlist" };
  }
}

