"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Mapa", icon: "🗺" },
  { href: "/planifica", label: "Planifica", icon: "🧭" },
  { href: "/accesibilidad", label: "Accesibilidad", icon: "♿" },
  { href: "/pulso", label: "Pulso", icon: "📊" },
  { href: "/nocturno", label: "Nocturno", icon: "🌙" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-bold">
          <span className="text-[#e8734a]">Transit</span>{" "}
          <span className="text-white">CDMX</span>
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#e8734a] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
