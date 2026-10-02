"use client";

import { memo } from "react";

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-[#05080e] py-10 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Brand */}
        <div className="font-extrabold text-white tracking-widest uppercase">
          MOD<span className="text-[#00e5ff]">_</span>CARBON
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap items-center gap-6 text-[11px] font-medium text-slate-400">
          <a href="#" className="hover:text-[#00e5ff] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[#00e5ff] transition-colors">ArtStation</a>
          <a href="#" className="hover:text-[#00e5ff] transition-colors">Contact</a>
          <a href="#" className="hover:text-[#00e5ff] transition-colors">Privacy Policy</a>
        </div>

        {/* Right Copyright */}
        <div className="text-[10px] text-slate-500 tracking-wider">
          © 2024 MOD_CARBON PRECISION ENGINEERING. ALL RIGHTS RESERVED.
        </div>

      </div>
    </footer>
  );
});
