"use client";

import { signIn } from "next-auth/react";

export function SignInForm() {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="flex w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
    >
      <span>Continue with Google</span>
    </button>
  );
}

