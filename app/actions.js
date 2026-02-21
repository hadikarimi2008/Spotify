/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSongs(limit = 50, genre = null) {
  try {
    const where = genre ? { genre } : {};
    
    const songs = await prisma.song.findMany({
      where,
      include: {
        artist: true,
        album: true,
      },
      orderBy: {
        playCount: "desc",
      },
      take: limit,
    });

    console.log(`✅ Fetched ${songs.length} songs`);
    return songs;
  } catch (error) {
    console.error("❌ Error fetching songs:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return [];
  }
}

export async function incrementPlayCount(songId) {
  try {
    await prisma.song.update({
      where: { id: songId },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error incrementing play count:", error);
  }
}

export async function searchSongs(query) {
  try {
    if (!query || query.trim().length === 0) {
      return { songs: [], artists: [], albums: [] };
    }

    const searchTerm = query.trim().toLowerCase();
    
    const [songs, artists, albums] = await Promise.all([
      prisma.song.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { artist: { name: { contains: searchTerm, mode: "insensitive" } } },
            { album: { title: { contains: searchTerm, mode: "insensitive" } } },
          ],
        },
        include: {
          artist: true,
          album: true,
        },
        take: 20,
      }),
      prisma.artist.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        take: 10,
      }),
      prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { artist: { name: { contains: searchTerm, mode: "insensitive" } } },
          ],
        },
        include: {
          artist: true,
        },
        take: 10,
      }),
    ]);

    return { songs, artists, albums };
  } catch (error) {
    console.error("Error searching:", error);
    return { songs: [], artists: [], albums: [] };
  }
}

export async function addToRecentlyPlayed(userId, songId) {
  try {
    if (!userId) return;

    const existing = await prisma.recentlyPlayed.findUnique({
      where: {
        userId_songId_recently: {
          userId,
          songId,
        },
      },
    });

    if (existing) {
      await prisma.recentlyPlayed.update({
        where: { id: existing.id },
        data: { playedAt: new Date() },
      });
    } else {
      await prisma.recentlyPlayed.create({
        data: {
          userId,
          songId,
        },
      });
    }

    const userPlayedCount = await prisma.recentlyPlayed.count({
      where: { userId },
    });

    if (userPlayedCount > 50) {
      const oldest = await prisma.recentlyPlayed.findFirst({
        where: { userId },
        orderBy: { playedAt: "asc" },
      });
      if (oldest) {
        await prisma.recentlyPlayed.delete({
          where: { id: oldest.id },
        });
      }
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error adding to recently played:", error);
  }
}

export async function getRecentlyPlayed(userId, limit = 20) {
  try {
    if (!userId) return [];

    const recentlyPlayed = await prisma.recentlyPlayed.findMany({
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
    });

    return recentlyPlayed.map((rp) => rp.song);
  } catch (error) {
    console.error("Error fetching recently played:", error);
    return [];
  }
}

export async function getTopArtists(limit = 10) {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        songs: {
          select: {
            playCount: true,
          },
        },
      },
      take: limit,
    });

    const artistsWithPlayCount = artists.map((artist) => ({
      ...artist,
      totalPlays: artist.songs.reduce((sum, song) => sum + song.playCount, 0),
    }));

    return artistsWithPlayCount
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .map(({ songs, ...artist }) => artist);
  } catch (error) {
    console.error("Error fetching top artists:", error);
    return [];
  }
}

export async function getArtist(id) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          include: {
            _count: {
              select: {
                songs: true,
              },
            },
          },
          orderBy: {
            releaseYear: "desc",
          },
        },
        songs: {
          include: {
            album: true,
          },
          orderBy: {
            playCount: "desc",
          },
        },
        _count: {
          select: {
            songs: true,
            albums: true,
          },
        },
      },
    });

    if (!artist) {
      return null;
    }

    return artist;
  } catch (error) {
    console.error("Error fetching artist:", error);
    return null;
  }
}

export async function getTopAlbums(limit = 10) {
  try {
    const albums = await prisma.album.findMany({
      include: {
        artist: true,
        songs: {
          include: {
            artist: true,
          },
          orderBy: {
            playCount: "desc",
          },
        },
      },
      orderBy: {
        releaseYear: "desc",
      },
      take: limit * 2,
    });

    const albumsWithPlayCount = albums.map((album) => ({
      ...album,
      totalPlays: album.songs.reduce((sum, song) => sum + song.playCount, 0),
    }));

    return albumsWithPlayCount
      .sort((a, b) => b.releaseYear - a.releaseYear || b.totalPlays - a.totalPlays)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return [];
  }
}

