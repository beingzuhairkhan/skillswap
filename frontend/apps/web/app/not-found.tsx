// app/not-found.tsx
"use client"; // Mark as client if you use any client hooks (optional here)

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
