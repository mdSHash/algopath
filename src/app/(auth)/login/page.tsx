"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Code2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/problems";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password.");
      } else if (res?.ok) {
        toast.success("Welcome back!");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      toast.error("Sign in failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm bg-[#111] border border-[#2a2a2a] rounded-xl p-7 space-y-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-black">
          <Code2 size={18} strokeWidth={2.5} />
        </div>
        <h1 className="text-lg font-semibold">Sign in to AlgoPath</h1>
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-neutral-500 font-medium">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-sm focus:border-emerald-500 outline-none transition"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-neutral-500 font-medium">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-sm focus:border-emerald-500 outline-none transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded-md transition"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        Sign In
      </button>

      <div className="text-xs text-neutral-500 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-emerald-400 hover:text-emerald-300">
          Create one
        </Link>
      </div>

      <div className="text-[11px] text-neutral-600 text-center pt-3 border-t border-[#1f1f1f]">
        Demo: <span className="font-mono text-neutral-400">demo@algopath.dev</span> / <span className="font-mono text-neutral-400">demo1234</span>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="text-neutral-500">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
