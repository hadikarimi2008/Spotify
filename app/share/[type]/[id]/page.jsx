import { Metadata } from "next";
import Image from "next/image";
import prisma from "@/lib/prisma";
import logo from "@/public/logo/spotify.png";

async function getShareData(type, id) {
  try {
    switch (type) {
      case "song":
        const song = await prisma.song.findUnique({
          where: { id },
          include: {
            artist: true,
            album: true,
          },
        });
        if (!song) return null;
        return {
          type: "song",
          title: song.title,
          description: `Listen to ${song.title} by ${song.artist?.name || "Unknown Artist"}`,
          image: song.imageUrl,
          artist: song.artist?.name,
          album: song.album?.title,
        };

      case "artist":
        const artist = await prisma.artist.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                songs: true,
                albums: true,
              },
            },
          },
        });
        if (!artist) return null;
        return {
          type: "artist",
          title: artist.name,
          description: `Listen to ${artist.name} - ${artist._count.songs} songs, ${artist._count.albums} albums`,
          image: artist.imageUrl,
        };

      case "album":
        const album = await prisma.album.findUnique({
          where: { id },
          include: {
            artist: true,
            _count: {
              select: {
                songs: true,
              },
            },
          },
        });
        if (!album) return null;
        return {
          type: "album",
          title: album.title,
          description: `${album.title} by ${album.artist?.name || "Unknown Artist"} - ${album._count.songs} songs`,
          image: album.imageUrl,
          artist: album.artist?.name,
        };

      case "playlist":
        const playlist = await prisma.playlist.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                songs: true,
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        });
        if (!playlist) return null;
        return {
          type: "playlist",
          title: playlist.name,
          description: playlist.description || `${playlist.name} - ${playlist._count.songs} songs${playlist.user ? ` by ${playlist.user.name}` : ""}`,
          image: playlist.imageUrl,
        };

      default:
        return null;
    }
  } catch (error) {
    console.error("Error fetching share data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { type, id } = await params;
  const shareData = await getShareData(type, id);

  if (!shareData) {
    return {
      title: "Spotify",
      description: "Music streaming platform",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/share/${type}/${id}`;

  return {
    title: `${shareData.title} | Spotify`,
    description: shareData.description,
    openGraph: {
      title: shareData.title,
      description: shareData.description,
      url: shareUrl,
      siteName: "Spotify",
      images: shareData.image
        ? [
            {
              url: shareData.image,
              width: 1200,
              height: 630,
              alt: shareData.title,
            },
          ]
        : [
            {
              url: `${baseUrl}/logo/spotify.png`,
              width: 1200,
              height: 630,
              alt: "Spotify",
            },
          ],
      type: "music.song",
    },
    twitter: {
      card: "summary_large_image",
      title: shareData.title,
      description: shareData.description,
      images: shareData.image ? [shareData.image] : [`${baseUrl}/logo/spotify.png`],
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}

export default async function SharePage({ params }) {
  const { type, id } = await params;
  const shareData = await getShareData(type, id);

  if (!shareData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Image src={logo} alt="Spotify" width={120} height={120} className="mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Content not found</h1>
          <p className="text-[#b3b3b3]">The content you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const playUrl = `${baseUrl}${type === "song" ? `?play=${id}` : type === "playlist" ? `/playlist/${id}` : `/${type}/${id}`}`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-2xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <Image
              src={logo}
              alt="Spotify"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
          </div>

          <div className="mb-8">
            {shareData.image ? (
              <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={shareData.image}
                  alt={shareData.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-700 to-blue-900 flex items-center justify-center shadow-2xl">
                <Image src={logo} alt="Spotify" width={120} height={120} className="opacity-50" />
              </div>
            )}

            <h1 className="text-white text-3xl md:text-4xl font-bold mb-3">
              {shareData.title}
            </h1>

            {shareData.artist && (
              <p className="text-white/90 text-xl md:text-2xl mb-2">
                {shareData.artist}
              </p>
            )}

            {shareData.album && (
              <p className="text-white/80 text-lg md:text-xl mb-4">
                {shareData.album}
              </p>
            )}

            <p className="text-white/70 text-base md:text-lg mb-8">
              {shareData.description}
            </p>
          </div>

          <a
            href={playUrl}
            className="inline-block bg-white text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform text-lg"
          >
            Open in Spotify
          </a>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Listen on Spotify - Music for everyone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

