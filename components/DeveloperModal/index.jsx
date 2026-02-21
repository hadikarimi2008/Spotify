"use client";

import React, { useState, useEffect } from "react";
import { Github, ExternalLink, Code2, X, Globe, Award } from "lucide-react";
import Link from "next/link";

const DeveloperModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const dev = {
    name: "Hadi Karimi",
    avatar: "https://avatars.githubusercontent.com/u/197248333?v=4",
    tech: ["Next.js", "React", "Tailwind", "JS"],
  };

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 mx-3 bg-[#1DB954] text-black rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 group"
        title="About Developer"
      >
        <Code2 size={10} />
      </button>

      {(isOpen || isAnimating) && (
        <div
          className={`fixed inset-0 z-[999] flex items-center justify-center p-6 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        >
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div
            className={`relative w-full max-w-[320px] bg-[#181818] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white z-20"
            >
              <X size={20} />
            </button>

            <div className="relative h-24 bg-gradient-to-b from-[#1DB954]/20 to-transparent" />

            <div className="px-6 pb-6 flex flex-col items-center -mt-12">
              <img
                src={dev.avatar}
                alt={dev.name}
                className="w-20 h-20 rounded-full border-4 border-[#181818] shadow-2xl relative z-10"
              />

              <h3 className="mt-3 text-xl font-bold text-white">{dev.name}</h3>
              <p className="text-[#1DB954] text-xs font-medium">
                Front-end Developer
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {dev.tech.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-white/5 text-[10px] text-neutral-400 rounded-md border border-white/5"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-6 w-full grid grid-cols-2 gap-2">
                <Link
                  href="https://github.com/hadikarimi2008"
                  target="_blank"
                  className="flex flex-col items-center p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors hover:text-[#1DB954]"
                >
                  <Github size={18} className="" />
                  <span className="text-[10px] mt-1 text-neutral-400">Git</span>
                </Link>
                <Link
                  href="https://certificates-zeta.vercel.app/"
                  target="_blank"
                  className="flex flex-col items-center p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors hover:text-[#1DB954]"
                >
                  <Award size={18} className="hover:text-[#1DB954]" />
                  <span className="text-[10px] mt-1 text-neutral-400">
                    Certs
                  </span>
                </Link>
              </div>
            </div>

            <div className="bg-black/20 py-2 text-center">
              <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                Hadi © 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperModal;
