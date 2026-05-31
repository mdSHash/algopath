"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Code2, LogOut, Trophy } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Code2 size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              Algo<span className="text-emerald-400">Path</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/problems"
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                isActive("/problems")
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
              }`}
            >
              Problems
            </Link>
            <Link
              href="/leaderboard"
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1.5 ${
                isActive("/leaderboard")
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
              }`}
            >
              <Trophy size={13} />
              Leaderboard
            </Link>
            {user ? (
              <Link
                href="/profile"
                className={`px-3 py-1.5 rounded-md text-sm transition ${
                  isActive("/profile")
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
                }`}
              >
                Profile
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-8 w-20 rounded bg-neutral-900 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-neutral-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.name ?? user.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-neutral-300 hover:text-neutral-100 transition rounded-md"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-md transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
