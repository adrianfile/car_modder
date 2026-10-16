"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Shield } from "lucide-react";
import { SessionUser } from "@/types/user";

const NAV_LINKS = [
  { label: "3D Configurator", href: "/configurator" },
  { label: "Inventory", href: "/inventory" },
  { label: "Portfolio", href: "/portofolio" },
  { label: "Projects", href: "/#projects" },
  { label: "Services", href: "/#services" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

export const Header = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    // Hindari request jika berada di dashboard atau configurator
    if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/configurator")) {
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Sembunyikan global navbar di dashboard dan configurator (karena punya layout navigasi sendiri)
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/configurator")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-md border-b border-slate-800/60 font-sans">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-widest text-white uppercase group-hover:text-[#00e5ff] transition-colors">
            MOD<span className="text-[#00e5ff]">_</span>CARBON
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold tracking-wider text-slate-300 uppercase text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`hover:text-[#00e5ff] transition-colors ${
                link.label === "3D Configurator" ? "text-[#00e5ff] font-bold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth State & Action Button */}
        <div className="flex items-center gap-3">
          {user ? (
            /* Logged In User Profile Pill */
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-[#00e5ff] transition-all group"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-[#00e5ff]/50 flex items-center justify-center text-xs font-mono text-[#00e5ff] font-bold shrink-0">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || user.email}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.name || user.email).substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs font-mono text-slate-200 group-hover:text-[#00e5ff] max-w-[120px] truncate transition-colors hidden sm:inline">
                {user.name || user.email.split("@")[0]}
              </span>
            </Link>
          ) : (
            /* Login Link */
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white px-3.5 py-2 rounded-sm border border-slate-700 hover:border-slate-500 transition-colors bg-slate-950/60"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>LOGIN</span>
            </Link>
          )}

          {/* CTA Button */}
          <Link
            href="/configurator"
            className="bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs px-5 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer inline-block"
          >
            START BUILD
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;
