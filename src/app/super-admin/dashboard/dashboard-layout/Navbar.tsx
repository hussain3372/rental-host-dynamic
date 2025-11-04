"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface NavbarProps {
  isCollapsed: boolean;
}

export function Navbar({ isCollapsed }: NavbarProps) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [today, setToday] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Load data from localStorage and set up event listeners
  useEffect(() => {
    const loadFromLocalStorage = () => {
      setFirstName(localStorage.getItem("superName") || "");
      setLastName(localStorage.getItem("superLast") || "");
      setEmail(localStorage.getItem("superEmail") || "");
      setProfileImage(localStorage.getItem("superProfile"));
    };

    // Initial load
    loadFromLocalStorage();

    // ✅ Format the date dynamically
    const date = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    setToday(formattedDate);
    
    // ✅ Determine greeting based on current hour
    const hour = date.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else if (hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");

    // ✅ Listen for profile image updates
    const handleProfileImageUpdate = (event: CustomEvent) => {
      setProfileImage(event.detail.profileImage);
    };

    // ✅ Listen for profile data updates
    const handleProfileUpdate = (event: CustomEvent) => {
      const { firstName: newFirstName, lastName: newLastName, email: newEmail } = event.detail;
      setFirstName(newFirstName || "");
      setLastName(newLastName || "");
      setEmail(newEmail || "");
    };

    // ✅ Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'superProfile') {
        setProfileImage(e.newValue);
      }
      if (e.key === 'superName') {
        setFirstName(e.newValue || "");
      }
      if (e.key === 'superLast') {
        setLastName(e.newValue || "");
      }
      if (e.key === 'superEmail') {
        setEmail(e.newValue || "");
      }
    };

    // Add event listeners
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    window.addEventListener('profileDataUpdated', handleProfileUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Set loading to false after initial load
    setLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
      window.removeEventListener('profileDataUpdated', handleProfileUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <>
        {/* ✅ Desktop Navbar Loading */}
        <nav
          className={`z-[1000] w-full bg-[#0A0C0B] fixed text-white hidden lg:block transition-all pl-5 pr-5 py-4 duration-300 ease-in-out`}
          style={{
            width: isCollapsed ? "calc(100vw - 139px)" : "calc(100vw - 279px)",
          }}
        >
          <div className="flex justify-between items-center border-b border-b-[#3b3d3c]">
            <div className={`${isCollapsed ? "ml-[10px]" : "ml-0"}`}>
              <h1 className="font-medium text-[24px]">Loading...</h1>
              <p className="text-[16px] pb-5 leading-[20px] font-normal text-white/60 pt-1">
                It&apos;s {today}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#2A2A2C] flex items-center justify-center animate-pulse"></div>
              <div className="animate-pulse">
                <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </nav>

        {/* ✅ Mobile Navbar Loading */}
        <nav className="fixed top-0 left-0 w-full text-white bg-[#111] lg:hidden py-3 z-50">
          <div className="flex justify-between items-center px-4 py-3">
            <div></div>
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-700"></div>
              <div className="flex flex-col">
                <div className="h-3 w-20 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      {/* ✅ Desktop Navbar */}
      <nav
        className={`z-[1000] w-full bg-[#0A0C0B] fixed text-white hidden lg:block transition-all pl-5 pr-5 py-4 duration-300 ease-in-out`}
        style={{
          width: isCollapsed ? "calc(100vw - 139px)" : "calc(100vw - 279px)",
        }}
      >
        <div className="flex justify-between items-center border-b pb-5  border-b-[#3b3d3c]">
          {/* Left side */}
          <div className={`${isCollapsed ? "ml-[10px]" : "ml-0"}`}>
            <h1 className="font-medium text-[24px]">
              {greeting}, {firstName || "User"}
            </h1>
            <p className="text-[16px] leading-[20px] font-normal text-white/60 pt-1">
              It&apos;s {today}
            </p>
          </div>

          {/* Right side */}
          <Link
            href="/super-admin/dashboard/profile"
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-[#2A2A2C] flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#B0B0B0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0"
                  />
                </svg>
              )}
            </div>

            <div>
              <p className="font-medium text-[14px] leading-[18px]">
                {firstName} {lastName}
              </p>
              <p className="text-[14px] leading-[18px] font-normal text-white/60">
                {email || "example@gmail.com"}
              </p>
            </div>
          </Link>
        </div>
      </nav>

      {/* ✅ Mobile Navbar */}
      <nav className="fixed top-0 left-0 w-full text-white bg-[#111] lg:hidden py-3 z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <div></div>
          <Link href="/super-admin/dashboard/profile">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#2A2A2C] flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#B0B0B0]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a8.25 8.25 0 0 1 15 0"
                    />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-[13px] font-medium">
                  {firstName} {lastName}
                </p>
                <p className="text-[12px] font-normal text-white/60">
                  {email || "example@gmail.com"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}