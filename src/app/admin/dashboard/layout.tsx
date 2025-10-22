"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "./dashboard-layout/Sidebar";
import { Navbar } from "./dashboard-layout/Navbar";
import { Manrope } from "next/font/google";
import { NotificationProvider } from "@/app/shared/context/AdminNotification";


import Image from "next/image";

type MainLayoutProps = {
  children: ReactNode;
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarCollapseChange = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  return (
    <NotificationProvider>
    <div
      className={`${manrope.className} relative min-h-[100vh] bg-[#0A0C0B]  text-white  overflow-hidden`}
    >
      {/* Sidebar */}
      <Sidebar onCollapseChange={handleSidebarCollapseChange} />

      {/* Background shape INSIDE the black background */}
      <div className="absolute left-[20%] bottom-0 w-full flex justify-start sm:block pointer-events-none ">
        <Image
          src="/images/shape.png"
          height={100}
          width={1000}
          alt="gradient"
          className="max-w-none"
          priority={false}
        />
      </div>

      {/* Main content wrapper */}
      <div
        className={`relative  transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:ml-[100px]" : "lg:ml-[266px]"
        }`}
      >
        <Navbar isCollapsed={isSidebarCollapsed} />
        <main className=" px-4 sm:px-6 pt-[99px] sm:pt-[120px] relative">
          {children}
        </main>
      </div>
    </div>
    </NotificationProvider>
  );
}
