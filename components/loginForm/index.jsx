/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import React, { useState } from "react";
import spotify from "@/public/logo/spotify.png";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <Image src={spotify} alt="Spotify Logo" width={40} className="md:w-[45px]" priority />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 tracking-tighter">
        Log in to Spotify
      </h1>

      <div className="w-full max-w-[324px] px-4 md:px-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-bold">
              Email or username
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-[#121212] border border-[#727272] rounded-[4px] hover:border-white focus:border-[#1DB954] focus:border-2 outline-none transition-all placeholder:text-[#a7a7a7]"
              placeholder="name@domain.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-[#121212] border border-[#727272] rounded-[4px] hover:border-white focus:border-[#1DB954] focus:border-2 outline-none transition-all placeholder:text-[#a7a7a7]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1DB954] text-black font-bold p-3 rounded-full mt-4 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#292929] text-center">
          <p className="text-[#a7a7a7] font-medium">Don't have an account?</p>
          <Link
            href="/signup"
            className="text-white hover:text-[#1ed760] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
