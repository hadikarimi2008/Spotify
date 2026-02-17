"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/logo/spotify.png";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function NotFound() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/loading/Spotify gradient color 3D icon rotation Lottie JSON animation.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(() => setAnimationData(null));
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
        {animationData ? (
          <div className="w-24 h-24 md:w-32 md:h-32">
            <Lottie animationData={animationData} loop={true} />
          </div>
        ) : (
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <Image
              src={logo}
              alt="Spotify"
              fill
              className="opacity-80"
              sizes="(max-width: 768px) 80px, 96px"
            />
          </div>
        )}
        <div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-2">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Page not found
          </h2>
          <p className="text-[#b3b3b3] text-sm md:text-base mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
