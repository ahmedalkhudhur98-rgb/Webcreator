"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Crest from "./Crest";
import Avatar from "./Avatar";

const NAV = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/projects", label: "Projects", icon: "▣" },
  { href: "/tasks", label: "Tasks", icon: "☰" },
  { href: "/timeline", label: "Timeline", icon: "═" },
  { href: "/team", label: "Team", icon: "♔" },
  { href: "/activity", label: "Activity", icon: "✦" },
];

type SidebarUser = {
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
};

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
              active
                ? "bg-gold/10 text-gold-light shadow-[inset_2px_0_0_0_var(--color-gold)]"
                : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
            }`}
          >
            <span
              className={`w-5 text-center text-base ${active ? "text-gold" : "text-zinc-600 group-hover:text-gold/60"} transition-colors`}
            >
              {item.icon}
            </span>
            <span className="font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="px-6 py-7">
      <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
        <Crest size={42} />
        <div className="leading-tight">
          <div className="font-display text-[17px] font-semibold tracking-wide text-champagne">
            The Elite
            <br />
            Brotherhood
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-gold/60">
            Est. MMXXIV
          </div>
        </div>
      </Link>
    </div>
  );

  const footer = (
    <div className="border-t border-ink-700 p-4">
      <div className="flex items-center gap-3">
        <Avatar initials={user.initials} color={user.avatarColor} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-200">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.role}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-gold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <Crest size={30} />
          <span className="font-display text-lg font-semibold tracking-wide text-champagne">
            The Elite Brotherhood
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="rounded-md border border-ink-600 p-2 text-zinc-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="animate-fade-up absolute left-0 top-0 flex h-full w-72 flex-col border-r border-ink-700 bg-ink-900">
            {brand}
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-ink-700 bg-ink-900 lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>
    </>
  );
}
