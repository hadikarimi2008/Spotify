/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/logo/spotify.png";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Error({ error, reset }) {
  const router = useRouter();
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
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-[#c4c4c4] text-sm md:text-base mb-6">
            {error?.message || "An unexpected error occurred"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-[#242424] hover:bg-[#2a2a2a] text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
