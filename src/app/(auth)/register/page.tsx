"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Code2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // L-4: preserve the `next` query param so a user who clicked "Create one"
  // from /login?next=/problems/two-sum lands back at the original deep link.
  const next = searchParams.get("next") ?? "/problems";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed.");
        return;
      }
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.ok) {
        toast.success("Welcome to AlgoPath!");
        router.push(next);
        router.refresh();
      } else {
        router.push(`/login?next=${encodeURIComponent(next)}`);
      }
    } catch (err) {
      toast.error("Registration failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(next)}`;

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm bg-[#111] border border-[#2a2a2a] rounded-xl p-7 space-y-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-black">
          <Code2 size={18} strokeWidth={2.5} />
        </div>
        <h1 className="text-lg font-semibold">Create your account</h1>
      </div>

      <Field label="Name" type="text" value={name} onChange={setName} autoComplete="name" required />
      <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
      <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
      <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" required />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded-md transition"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        Create Account
      </button>

      <div className="text-xs text-neutral-500 text-center">
        Already have an account?{" "}
        <Link href={loginHref} className="text-emerald-400 hover:text-emerald-300">
          Sign in
        </Link>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="text-neutral-500">Loading…</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-wider text-neutral-500 font-medium">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-sm focus:border-emerald-500 outline-none transition"
      />
    </div>
  );
}
