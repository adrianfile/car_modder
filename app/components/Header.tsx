"use client";

import Link from "next/link";

const NAV_LINKS = [
  { label: "3D Configurator", href: "/configurator" },
  { label: "Inventory", href: "/inventory" },
  { label: "Portfolio", href: "/portofolio" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-md border-b border-slate-800/60">
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

        {/* CTA Button */}
        <Link
          href="/configurator"
          className="bg-[#00e5ff] hover:bg-[#33ebff] text-slate-950 font-black text-xs px-6 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer inline-block"
        >
          START BUILD
        </Link>

      </div>
    </header>
  );
};

export default Header;
