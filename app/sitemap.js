/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const [songs, artists, albums] = await Promise.all([
      prisma.song.findMany({
        select: { id: true, updatedAt: true },
        take: 1000,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.artist.findMany({
        select: { id: true },
        take: 500,
      }),
      prisma.album.findMany({
        select: { id: true },
        take: 500,
      }),
    ]);

    const songUrls = songs.map((song) => ({
      url: `${baseUrl}/share/song/${song.id}`,
      lastModified: song.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const artistUrls = artists.map((artist) => ({
      url: `${baseUrl}/share/artist/${artist.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const albumUrls = albums.map((album) => ({
      url: `${baseUrl}/share/album/${album.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      ...songUrls,
      ...artistUrls,
      ...albumUrls,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
