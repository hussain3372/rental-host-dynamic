"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { profile } from "@/app/api/Admin/profile";

interface NavbarProps {
  isCollapsed: boolean;
}

export function Navbar({ isCollapsed }: NavbarProps) {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [today, setToday] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await profile.fetchProfileData();
        console.log("Navbar Profile API Response:", res);
        
        if (res.data?.data) {
          const profileData = res.data.data;
          setFirstName(profileData.firstName || "");
          setLastName(profileData.lastName || "");
          setEmail(profileData.email || "");
          
          // Also update localStorage for consistency
          localStorage.setItem("firstname", profileData.firstName || "");
          localStorage.setItem("lastname", profileData.lastName || "");
          localStorage.setItem("email", profileData.email || "");
        }
      } catch (error) {
        console.error("Error fetching profile in navbar:", error);
        // Fallback to localStorage if API fails
        setFirstName(localStorage.getItem("firstname") || "");
        setLastName(localStorage.getItem("lastname") || "");
        setEmail(localStorage.getItem("email") || "");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

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
        <div className="flex justify-between items-center border-b border-b-[#3b3d3c]">
          {/* Left side */}
          <div className={`${isCollapsed ? "ml-[10px]" : "ml-0"}`}>
            <h1 className="font-medium text-[24px]">
              {greeting}, {firstName || "User"}
            </h1>
            <p className="text-[16px] pb-5 leading-[20px] font-normal text-white/60 pt-1">
              It&apos;s {today}
            </p>
          </div>

          {/* Right side */}
          <Link
            href="/admin/dashboard/profile"
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-[#2A2A2C] flex items-center justify-center">
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
          <Link href="/admin/dashboard/profile">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#2A2A2C] flex items-center justify-center">
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