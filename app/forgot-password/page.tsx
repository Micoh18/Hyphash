"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/redirects";
import { authErrors } from "@/lib/auth/errors";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthCallbackUrl("/reset-password"),
    });

    if (resetError) {
      setError(authErrors().resetEmailFailed);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-[var(--foreground)]">
            Hyphash
          </Link>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Recover your account
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest">
              ✓
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Check your email</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              If an account exists for <strong>{email}</strong>, we sent a password recovery link.
            </p>
            <Link href="/login" className="inline-block text-sm text-forest hover:text-forest-light font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Enter your email and we will send you a secure link to reset your password.
            </p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-forest text-white rounded-lg text-sm font-semibold hover:bg-forest-light transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send recovery link"}
            </button>

            <p className="text-center text-sm text-[var(--muted-foreground)]">
              Remembered it?{" "}
              <Link href="/login" className="text-forest hover:text-forest-light font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
