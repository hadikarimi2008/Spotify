import { getArtist } from "@/app/actions";
import { notFound } from "next/navigation";
import ArtistPageClient from "./client";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const artist = await getArtist(id);

  if (!artist) {
    return {
      title: "Artist Not Found | Spotify",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: `${artist.name} | Spotify`,
    description: artist.bio || `Listen to ${artist.name} - ${artist._count.songs} songs, ${artist._count.albums} albums`,
    openGraph: {
      title: artist.name,
      description: artist.bio || `Listen to ${artist.name} - ${artist._count.songs} songs, ${artist._count.albums} albums`,
      url: `${baseUrl}/artist/${id}`,
      siteName: "Spotify",
      images: artist.imageUrl
        ? [
            {
              url: artist.imageUrl,
              width: 1200,
              height: 630,
              alt: artist.name,
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
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: artist.name,
      description: artist.bio || `Listen to ${artist.name}`,
      images: artist.imageUrl ? [artist.imageUrl] : [`${baseUrl}/logo/spotify.png`],
    },
    alternates: {
      canonical: `${baseUrl}/artist/${id}`,
    },
  };
}

export default async function ArtistPage({ params }) {
  const { id } = await params;
  const artist = await getArtist(id);

  if (!artist) {
    notFound();
  }

  return <ArtistPageClient artist={artist} />;
}

