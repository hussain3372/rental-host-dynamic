import Image from "next/image";
import Link from "next/link";
import React from "react";

interface NavbarProps {
  isCollapsed: boolean;
}

export function Navbar({ isCollapsed }: NavbarProps) {
  return (
    <>
      {/* Desktop Navbar (unchanged) */}
      <nav
        className={` z-[1000] w-full bg-[#0A0C0B] fixed text-white hidden lg:block transition-all pl-5 pr-5  py-4 duration-300 ease-in-out`}
        style={{
          width: isCollapsed ? "calc(100vw - 139px )" : "calc(100vw - 279px)",
        }}
      >
        <div className="flex justify-between items-center  border-b border-b-[#3b3d3c]  ">
          {/* Left side */}
         <div
  className={`${isCollapsed ? "ml-[10px]" : "ml-0"}`}
>
  <h1 className="font-medium text-[24px]">Good Morning, Alex</h1>
  <p className="text-[16px] pb-5 leading-[20px] font-normal text-white/60 pt-1">
    It&apos;s Tuesday, 21 December 2024
  </p>
</div>


          {/* Right side */}
          <Link href="/super-admin/dashboard/profile" className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10">
              <Image
                src="/images/person.png"
                alt="profile pic"
                height={32}
                width={32}
                className="rounded-full object-cover h-10 w-10"
              />
            </div>
            <div>
              <p className="font-medium text-[14px] leading-[18px]">John Deo</p>
              <p className="text-[14px] leading-[18px] font-normal text-white/60">
                johndeo@gmail.com
              </p>
            </div>
          </Link>

        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 w-full text-white bg-[#111] lg:hidden py-3 z-50">
        <div className="flex justify-between items-center px-4 py-3">
          {/* Left side */}
          <div className=""></div>

          {/* Right side */}
          <Link href="/super-admin/dashboard/profile">

            <div className="flex items-center gap-2">
              <Image
                src="/images/person.png"
                alt="profile pic"
                height={32}
                width={32}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="text-[13px] font-medium">John Deo</p>
                <p className="text-[12px] font-normal text-white/60">johndeo@gmail.com</p>
              </div>
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}
