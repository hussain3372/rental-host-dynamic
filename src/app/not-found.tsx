"use client";

import Link from "next/link";

export default function NotFound() {
  return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-[#121212]">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-white">
        Oops! Page Not Found
      </h2>
      <p className="text-[#FFFFFFCC] mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#EFFC76] text-[#0A0C0B] rounded-lg hover:bg-[#DCEF6D] transition-colors"
      >
        Go Back Home

      </Link>
    </div>
  );
}




