/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import spotify from "@/public/logo/spotify.png";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    year: "",
    month: "",
    day: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const nextStep = (e) => {
    e.preventDefault();
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Auto login after signup
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white p-4 md:p-8">
      <div className="mb-6 md:mb-10 mt-2 md:mt-4">
        <Image src={spotify} alt="Spotify" width={35} className="md:w-[40px]" priority />
      </div>

      <div className="w-full max-w-[400px] px-4 md:px-0">
        <div className="mb-8 h-1 w-full bg-[#292929] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DB954] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={nextStep} className="flex flex-col gap-6">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4">
              What is your email address?
            </h1>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Email address</label>
              <input
                required
                type="email"
                name="email"
                placeholder="name@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-[#121212] border border-[#727272] rounded-[4px] focus:border-[#1DB954] focus:border-2 outline-none placeholder:text-[#a7a7a7]"
              />
            </div>
            <button className="w-fit self-end bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Next
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={nextStep} className="flex flex-col gap-6">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4">
              Create a password
            </h1>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Password</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                className="w-full p-3 bg-[#121212] border border-[#727272] rounded-[4px] focus:border-[#1DB954] focus:border-2 outline-none"
              />
              <p className="text-xs text-[#a7a7a7]">
                Your password must be at least 8 characters long.
              </p>
            </div>
            <button className="w-fit self-end bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Next
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={nextStep} className="flex flex-col gap-6">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4">
              Tell us about yourself
            </h1>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Name</label>
              <p className="text-xs text-[#a7a7a7]">
                This name will appear on your profile.
              </p>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-[#121212] border border-[#727272] rounded-[4px] focus:border-[#1DB954] focus:border-2 outline-none"
              />
            </div>
            <button className="w-fit self-end bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Next
            </button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={nextStep} className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              What's your date of birth?
            </h1>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">Date of birth</label>
              <div className="flex gap-3">
                <input
                  required
                  placeholder="yyyy"
                  name="year"
                  className="w-1/3 p-3 bg-[#121212] border border-[#727272] rounded-[4px] outline-none"
                  onChange={handleChange}
                />
                <select
                  name="month"
                  required
                  className="w-1/3 p-3 bg-[#121212] border border-[#727272] rounded-[4px] outline-none text-[#a7a7a7] focus:border-[#1DB954]"
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Month
                  </option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <input
                  required
                  placeholder="dd"
                  name="day"
                  className="w-1/3 p-3 bg-[#121212] border border-[#727272] rounded-[4px] outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>
            <button className="w-fit self-end bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
              Next
            </button>
          </form>
        )}

        {step === 5 && (
          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Terms & Conditions
            </h1>
            <div className="flex flex-col gap-4 text-sm text-[#a7a7a7]">
              <p>
                By clicking on sign-up, you agree to Spotify's Terms and
                Conditions of Use.
              </p>
              <div className="flex items-center gap-3 text-white">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#1DB954] cursor-pointer"
                  id="marketing"
                />
                <label htmlFor="marketing" className="cursor-pointer">
                  I would prefer not to receive marketing messages from Spotify
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1DB954] text-black font-bold p-4 rounded-full mt-4 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <p className="text-[#a7a7a7] text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white underline hover:text-[#1DB954]"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
