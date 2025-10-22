import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">🚀 Coming Soon</h1>
      <p className="text-lg md:text-xl mb-8 text-[#fff]">
        We are building something better to serve.
      </p>
       <p className="text-md md:text-lg mb-4 text-gray-300 max-w-2xl w-full">
    Our team is working hard behind the scenes to bring you an innovative and 
    user-friendly experience. Get ready for a platform that combines speed, 
    simplicity, and powerful features.
  </p>
      <Link
        href="/super-admin/dashboard"
        className="px-6 py-3 z-[10000000] cursor-pointer rounded-lg bg-white text-[#000] font-semibold shadow-md hover:bg-[#f1f1f1] transition-all"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default page;
