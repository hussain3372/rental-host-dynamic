"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import SearchDrawer from "@/app/shared/SearchDrawer";
import SearchDrawerShortcut from "@/app/shared/SearchDrawerShortcut";
// import { allProperties } from "@/app/(main)/search-page/data/properties";
interface SidebarProps {
  onCollapseChange: (isCollapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleCollapse = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    } else {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      onCollapseChange(newCollapsedState);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  const isActive = (route: string) => pathname === route;

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center z-[100] justify-between px-4 py-6  fixed w-full ">
        <button onClick={toggleMobileMenu} className="text-white">
          <Menu size={28} />
        </button>
      </div>

      <div className="flex max-h-[100vh] bg-[#121315] relative">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={` pt-[24px] z-[100] bg-[#121315] mt-0  sm:mt-0 px-[20px] ${
            isCollapsed ? "flex items-center w-[100px]" : "w-[266px]"
          } border-r h-[100vh] overflow-y-auto scrollbar-hide  overflow-x-hidden border-r-[#222325] fixed flex flex-col
          transition-all duration-300 ease-in-out z-30
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
        >
          {/* Header */}
          <Link
            onClick={() => {
              setIsMobileOpen(false);
            }}
            href="/super-admin/dashboard"
            className="justify-between items-center mb-[48px] flex"
          >
            <Image
              src="/images/auth-logo.png"
              alt="Logo"
              width={53}
              height={31}
              className="cursor-pointer hover:scale-110 h-auto w-auto transition-transform duration-200"
            />
          </Link>

          {/* Search & Notifications */}
          <div className="border-b border-b-[#3f4041] pb-[32px] mb-[32px] ml-[-14px]">
            {/* Search */}
            {/* Search */}
            <div
              className={`flex justify-between items-center cursor-pointer mb-[20px]`}
            >
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex justify-between items-center w-full px-[12px] py-[8px] rounded-[6px] 
      transition-all duration-200 group 
      ${
        // isActive('/search') ? 'bg-[#4a5439]' :
        // 'hover:bg-[#4a5439]'
        ""
      }`}
              >
                <div className="flex gap-[8px] items-center">
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src="/images/search.png"
                      alt="Search"
                      width={isCollapsed ? 28 : 16}
                      height={isCollapsed ? 28 : 16}
                      className={`opacity-80 
            ${
              // 'group-hover:opacity-0'
              // isActive('/search') ? 'opacity-0' :
              ""
            } absolute transition-opacity`}
                    />
                    <Image
                      src="/images/search.png"
                      alt="Search"
                      width={isCollapsed ? 28 : 16}
                      height={isCollapsed ? 28 : 16}
                      className={`opacity-0 
            ${
              // 'group-hover:opacity-100'
              // isActive('/search') ? 'opacity-100' :
              ""
            } absolute transition-opacity`}
                    />
                  </div>
                  <p
                    className={`font-normal text-[16px] leading-[20px] text-[#ffffff] transition-colors 
          ${isCollapsed ? "hidden" : "block"} 
          ${
            // 'group-hover:text-[#eefb75]'
            // isActive('/search') ? 'text-[#eefb75]' :
            ""
          }`}
                  >
                    Search
                  </p>
                </div>

                <div
                  className={`flex gap-[4px] ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  <div className="w-[20px] h-[20px] bg-[#3f4041] rounded-[3px] border-b border-b-white flex items-center justify-center">
                    <span className="text-[#ffffff] text-[10px] font-normal">
                      K
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Notifications */}
            <Link
              onClick={() => setIsMobileOpen(false)}
              href="/super-admin/dashboard/notifications"
              className={`flex justify-between items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 ${
                isActive("/super-admin/dashboard/notifications")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="flex gap-[8px] items-center">
                {/* Single SVG with dynamic fill */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={isCollapsed ? 28 : 16}
                  height={isCollapsed ? 28 : 16}
                  viewBox="0 0 16 17"
                  fill="none"
                  className={`transition-colors ${
                    isActive("/super-admin/dashboard/notifications")
                      ? "fill-[#eefb75]" // active color
                      : "fill-white group-hover:fill-[#eefb75]" // inactive + hover
                  }`}
                >
                  <path d="M11.232 0.989679C11.0447 1.38447 10.9474 1.81598 10.9474 2.25297H2.31579C1.73474 2.25297 1.26316 2.7246 1.26316 3.30571V13.8331C1.26316 14.4143 1.73474 14.8859 2.31579 14.8859H12.8421C13.4232 14.8859 13.8947 14.4143 13.8947 13.8331V5.20233C14.3469 5.20233 14.7756 5.10043 15.1587 4.91851L15.1579 13.8331C15.1579 14.4474 14.9139 15.0365 14.4796 15.4708C14.0453 15.9052 13.4563 16.1492 12.8421 16.1492H2.31579C1.7016 16.1492 1.11257 15.9052 0.678279 15.4708C0.243984 15.0365 0 14.4474 0 13.8331V3.30571C0 2.69146 0.243984 2.10237 0.678279 1.66803C1.11257 1.23369 1.7016 0.989679 2.31579 0.989679H11.232ZM13.8947 0.14917C14.4531 0.14917 14.9886 0.370997 15.3834 0.765852C15.7782 1.16071 16 1.69625 16 2.25465C16 2.81306 15.7782 3.3486 15.3834 3.74346C14.9886 4.13831 14.4531 4.36014 13.8947 4.36014C13.3364 4.36014 12.8009 4.13831 12.4061 3.74346C12.0113 3.3486 11.7895 2.81306 11.7895 2.25465C11.7895 1.69625 12.0113 1.16071 12.4061 0.765852C12.8009 0.370997 13.3364 0.14917 13.8947 0.14917Z" />
                </svg>

                {/* Text with same color logic */}
                <p
                  className={`font-normal text-[16px] leading-[20px] ${
                    isActive("/super-admin/dashboard/notifications")
                      ? "text-[#eefb75]"
                      : "text-white group-hover:text-[#eefb75]"
                  } ${isCollapsed ? "hidden" : "block"}`}
                >
                  Notifications
                </p>
              </div>

              <div
                className={`w-[20px] h-[20px] bg-[#D84725] rounded-[4px] border-b border-b-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                  isCollapsed ? "hidden" : "flex"
                }`}
              >
                <span className="text-white text-[10px] font-medium">8</span>
              </div>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 ml-[-14px]">
            {/* Home */}
            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="relative w-[20px] h-[20px] group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  className={`transition-colors duration-200 ${
                    isActive("/super-admin/dashboard")
                      ? "stroke-[#eefb75]"
                      : "stroke-white group-hover:stroke-[#eefb75]"
                  }`}
                >
                  <path
                    d="M7.48699 17.3683H4.74533C3.73533 17.3683 2.91699 16.55 2.91699 15.54V10.1616C2.91761 9.76983 3.00194 9.38268 3.16435 9.02611C3.32675 8.66954 3.56347 8.35179 3.85866 8.09414L8.80033 3.78998C9.13309 3.5005 9.55927 3.34106 10.0003 3.34106C10.4414 3.34106 10.8676 3.5005 11.2003 3.78998L16.142 8.09498C16.4371 8.35253 16.6737 8.67014 16.8361 9.02656C16.9985 9.38298 17.0829 9.76997 17.0837 10.1616V15.54C17.0837 16.0247 16.8911 16.4897 16.5484 16.8325C16.2057 17.1754 15.7409 17.3681 15.2562 17.3683H12.742V11.8841C12.742 11.1275 12.1287 10.5133 11.3712 10.5133H8.85866C8.10116 10.5133 7.48783 11.1275 7.48783 11.8841L7.48699 17.3683ZM7.48699 17.3683H12.7428"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                Home
              </p>
            </Link>

            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard/applications"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/applications")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="relative w-[20px] h-[20px] group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  className={`transition-colors duration-200 ${
                    isActive("/super-admin/dashboard/applications")
                      ? "stroke-[#eefb75]"
                      : "stroke-white group-hover:stroke-[#eefb75]"
                  }`}
                >
                  <path d="M3.33203 5.98244C3.33203 4.41078 3.33203 3.62578 3.82036 3.13744C4.3087 2.64911 5.0937 2.64911 6.66536 2.64911H13.332C14.9037 2.64911 15.6887 2.64911 16.177 3.13744C16.6654 3.62578 16.6654 4.41078 16.6654 5.98244V12.6491C16.6654 15.0058 16.6654 16.1849 15.9329 16.9166C15.2012 17.6491 14.022 17.6491 11.6654 17.6491H8.33203C5.97536 17.6491 4.7962 17.6491 4.06453 16.9166C3.33203 16.1849 3.33203 15.0058 3.33203 12.6491V5.98244Z" />
                  <path
                    d="M12.5 15.1489V17.6489M7.5 15.1489V17.6489M7.5 6.81561H12.5M7.5 10.1489H12.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>

              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/applications")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                All Applications
              </p>
            </Link>

            {/* Applications */}
            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard/user-management"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/user-management") ||
                isActive("/super-admin/dashboard/user-management/detail/[id]")
                  ? "bg-[#4a5439] text-[#EFFC76]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="relative w-[20px] h-[20px]">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    isActive("/super-admin/dashboard/user-management")
                      ? "stroke-[#EFFC76]"
                      : "stroke-white group-hover:stroke-[#EFFC76]"
                  }`}
                >
                  <path
                    d="M14.9402 16.5108H16.7219C16.8786 16.5132 17.0336 16.4777 17.1736 16.4072C17.3136 16.3368 17.4345 16.2335 17.5259 16.1061C17.6172 15.9788 17.6764 15.8312 17.6984 15.676C17.7203 15.5208 17.7044 15.3626 17.6519 15.2149C17.1976 14.2425 16.4784 13.4179 15.5767 12.8357C14.6751 12.2535 13.6276 11.9372 12.5544 11.9233M12.5544 9.62411C12.9554 9.62422 13.3526 9.54532 13.7231 9.39193C14.0937 9.23853 14.4304 9.01364 14.714 8.7301C14.9976 8.44656 15.2226 8.10993 15.3761 7.73943C15.5296 7.36892 15.6086 6.97181 15.6086 6.57077C15.6097 6.16903 15.5315 5.77103 15.3785 5.39956C15.2255 5.0281 15.0007 4.69048 14.7169 4.40606C14.4332 4.12163 14.0961 3.896 13.725 3.74208C13.354 3.58817 12.9561 3.509 12.5544 3.50911M7.78357 9.71994C8.70168 9.71773 9.58143 9.35141 10.2298 8.70134C10.8781 8.05127 11.2421 7.17056 11.2419 6.25244C11.2419 5.33501 10.8775 4.45516 10.2287 3.80644C9.58002 3.15772 8.70016 2.79327 7.78273 2.79327C6.86531 2.79327 5.98545 3.15772 5.33673 3.80644C4.68801 4.45516 4.32357 5.33501 4.32357 6.25244C4.32357 7.17056 4.68777 8.05118 5.33628 8.7011C5.98478 9.35101 6.86462 9.71712 7.78273 9.71911M11.6877 17.5049C11.9813 17.5045 12.269 17.4229 12.5189 17.269C12.7689 17.1152 12.9714 16.8952 13.1041 16.6333C13.2367 16.3714 13.2942 16.078 13.2703 15.7854C13.2464 15.4929 13.1419 15.2126 12.9686 14.9758C12.3612 14.1695 11.5792 13.5111 10.6813 13.0499C9.78338 12.5886 8.79274 12.3365 7.78357 12.3124C6.77433 12.3366 5.78365 12.5889 4.88571 13.0502C3.98778 13.5116 3.20588 14.1702 2.59857 14.9766C2.42578 15.2135 2.32182 15.4935 2.29816 15.7857C2.2745 16.078 2.33206 16.3711 2.46449 16.6327C2.59692 16.8942 2.79907 17.1141 3.04861 17.2681C3.29815 17.422 3.58537 17.504 3.87857 17.5049H11.6877Z"
                    // stroke={isActive('/super-admin/dashboard/user-management') ? "#EFFC76" : "white"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/user-management")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                User Management
              </p>
            </Link>

            {/* Certificates */}
            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard/certificates"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/certificates")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="relative w-[20px] h-[20px] group">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    isActive("/super-admin/dashboard/certificates")
                      ? "stroke-[#EFFC76]"
                      : "stroke-white group-hover:stroke-[#EFFC76]"
                  }`}
                >
                  <path
                    d="M9.58333 18.4825C6.24417 18.4825 4.575 18.4825 3.5375 17.2616C2.5 16.0425 2.5 14.0775 2.5 10.1491C2.5 6.2208 2.5 4.25663 3.5375 3.0358C4.575 1.81496 6.24417 1.8158 9.58333 1.8158C12.9225 1.8158 14.5917 1.8158 15.6292 3.0358C16.4642 4.01913 16.6275 5.4833 16.6592 8.0658M6.66667 6.8158H12.5M6.66667 10.9825H9.16667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16.3415 15.2366C16.822 14.8874 17.1795 14.3951 17.3629 13.8302C17.5463 13.2653 17.5462 12.6568 17.3626 12.092C17.1789 11.5271 16.8212 11.0349 16.3406 10.6859C15.86 10.3369 15.2813 10.149 14.6874 10.1491H14.4782C13.8843 10.1492 13.3057 10.3372 12.8253 10.6863C12.3449 11.0354 11.9873 11.5276 11.8037 12.0924C11.6202 12.6571 11.6201 13.2655 11.8036 13.8304C11.987 14.3952 12.3445 14.8874 12.8249 15.2366M12.8249 15.2366C13.305 15.5867 13.884 15.7749 14.4782 15.7741H14.6865C15.2807 15.7749 15.8598 15.5867 16.3399 15.2366L16.8257 16.7658C17.0107 17.3491 17.104 17.6408 17.0782 17.8224C17.0257 18.2008 16.7174 18.4808 16.3532 18.4824C16.1782 18.4824 15.9165 18.3458 15.3924 18.0708C15.1674 17.9524 15.0557 17.8941 14.9407 17.8591C14.7069 17.7892 14.4578 17.7892 14.224 17.8591C14.109 17.8941 13.9965 17.9524 13.7724 18.0708C13.2482 18.3458 12.9865 18.4833 12.8115 18.4824C12.4474 18.4808 12.139 18.2008 12.0865 17.8224C12.0615 17.6408 12.1532 17.3491 12.339 16.7658L12.8249 15.2366Z" />
                </svg>
              </div>
              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/certificates")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                Certification Setup
              </p>
            </Link>
            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard/finances"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/finances")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="relative w-[20px] h-[20px] group">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    isActive("/super-admin/dashboard/finances")
                      ? "stroke-[#EFFC76]"
                      : "stroke-white group-hover:stroke-[#EFFC76]"
                  }`}
                >
                  <path d="M12.8 5.8C12.8 4.4798 12.8 3.8204 12.3898 3.4102C11.9796 3 11.3202 3 10 3C8.6798 3 8.0204 3 7.6102 3.4102C7.2 3.8204 7.2 4.4798 7.2 5.8M3 11.4C3 8.7603 3 7.4401 3.8204 6.6204C4.6408 5.8007 5.9603 5.8 8.6 5.8H11.4C14.0397 5.8 15.3599 5.8 16.1796 6.6204C16.9993 7.4408 17 8.7603 17 11.4C17 14.0397 17 15.3599 16.1796 16.1796C15.3592 16.9993 14.0397 17 11.4 17H8.6C5.9603 17 4.6401 17 3.8204 16.1796C3.0007 15.3592 3 14.0397 3 11.4Z" />
                  <path
                    d="M9.99961 13.7331C10.7731 13.7331 11.3996 13.2109 11.3996 12.5669C11.3996 11.9229 10.7731 11.4 9.99961 11.4C9.22611 11.4 8.59961 10.8778 8.59961 10.2331C8.59961 9.58914 9.22611 9.06694 9.99961 9.06694M9.99961 13.7331C9.22611 13.7331 8.59961 13.2109 8.59961 12.5669M9.99961 13.7331V14.2M9.99961 9.06694V8.60004M9.99961 9.06694C10.7731 9.06694 11.3996 9.58914 11.3996 10.2331"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/finances")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                Finances
              </p>
            </Link>
            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard/reports"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/reports")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <div className="relative w-[20px] h-[20px] group">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    isActive("/super-admin/dashboard/reports")
                      ? "stroke-[#EFFC76]"
                      : "stroke-white group-hover:stroke-[#EFFC76]"
                  }`}
                >
                  <path
                    d="M1.66699 10.1488C1.66699 6.22043 1.66699 4.25626 2.88699 3.03543C4.10866 1.81543 6.07199 1.81543 10.0003 1.81543C13.9287 1.81543 15.8928 1.81543 17.1128 3.03543C18.3337 4.2571 18.3337 6.22043 18.3337 10.1488C18.3337 14.0771 18.3337 16.0413 17.1128 17.2613C15.8937 18.4821 13.9287 18.4821 10.0003 18.4821C6.07199 18.4821 4.10783 18.4821 2.88699 17.2613C1.66699 16.0421 1.66699 14.0771 1.66699 10.1488Z"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M5.83398 11.8153L7.74482 9.90443C7.90109 9.74821 8.11301 9.66044 8.33398 9.66044C8.55495 9.66044 8.76688 9.74821 8.92315 9.90443L10.2448 11.2261C10.4011 11.3823 10.613 11.4701 10.834 11.4701C11.055 11.4701 11.2669 11.3823 11.4232 11.2261L14.1673 8.48193M14.1673 8.48193V10.5653M14.1673 8.48193H12.084"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/reports")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                Reports & Insights
              </p>
            </Link>
          </div>

          {/* Bottom Section */}
          <div className="pb-[24px] ml-[-14px]">
            {/* Settings */}
            <Link
              onClick={() => {
                setIsMobileOpen(false);
              }}
              href="/super-admin/dashboard/subscription-plan"
              className={`flex gap-[8px] items-center group px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/subscription-plan")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              {/* Default (white) icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className={`opacity-100 group-hover:hidden ${
                  isActive("/super-admin/dashboard/subscription-plan")
                    ? "hidden"
                    : "block"
                }`}
              >
                <path
                  d="M3.16345 11.4771C2.72087 10.6823 2.5 10.284 2.5 9.84981C2.5 9.41559 2.72087 9.01819 3.16345 8.22338L4.29124 6.1937L5.48428 4.20167C5.95196 3.42109 6.18539 3.03038 6.56104 2.81285C6.93752 2.59616 7.39182 2.58947 8.30124 2.57441L10.6246 2.5376L12.9462 2.57441C13.8565 2.58947 14.3108 2.59616 14.6865 2.81369C15.0621 3.03121 15.2972 3.42109 15.764 4.20167L16.9579 6.1937L18.0874 8.22338C18.5291 9.01819 18.75 9.41559 18.75 9.84981C18.75 10.284 18.5291 10.6814 18.0865 11.4762L16.9579 13.5059L15.7649 15.4979C15.2972 16.2785 15.0638 16.6692 14.6881 16.8868C14.3116 17.1034 13.8573 17.1101 12.9479 17.1252L10.6246 17.162L8.30291 17.1252C7.39265 17.1101 6.93836 17.1034 6.56271 16.8859C6.18706 16.6684 5.95196 16.2785 5.48512 15.4979L4.29124 13.5059L3.16345 11.4771Z"
                  stroke="white"
                  strokeWidth="1.2"
                />
                <path
                  d="M10.6242 12.326C12.0104 12.326 13.1341 11.2022 13.1341 9.81606C13.1341 8.42988 12.0104 7.30615 10.6242 7.30615C9.23798 7.30615 8.11426 8.42988 8.11426 9.81606C8.11426 11.2022 9.23798 12.326 10.6242 12.326Z"
                  stroke="white"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Yellow (active/hover) icon */}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className={`${
                  isActive("/super-admin/dashboard/subscription-plan")
                    ? "block opacity-100"
                    : "hidden group-hover:block"
                }`}
              >
                <path
                  d="M3.16345 11.4771C2.72087 10.6823 2.5 10.284 2.5 9.84981C2.5 9.41559 2.72087 9.01819 3.16345 8.22338L4.29124 6.1937L5.48428 4.20167C5.95196 3.42109 6.18539 3.03038 6.56104 2.81285C6.93752 2.59616 7.39182 2.58947 8.30124 2.57441L10.6246 2.5376L12.9462 2.57441C13.8565 2.58947 14.3108 2.59616 14.6865 2.81369C15.0621 3.03121 15.2972 3.42109 15.764 4.20167L16.9579 6.1937L18.0874 8.22338C18.5291 9.01819 18.75 9.41559 18.75 9.84981C18.75 10.284 18.5291 10.6814 18.0865 11.4762L16.9579 13.5059L15.7649 15.4979C15.2972 16.2785 15.0638 16.6692 14.6881 16.8868C14.3116 17.1034 13.8573 17.1101 12.9479 17.1252L10.6246 17.162L8.30291 17.1252C7.39265 17.1101 6.93836 17.1034 6.56271 16.8859C6.18706 16.6684 5.95196 16.2785 5.48512 15.4979L4.29124 13.5059L3.16345 11.4771Z"
                  stroke="#eefb75"
                  strokeWidth="1.2"
                />
                <path
                  d="M10.6242 12.326C12.0104 12.326 13.1341 11.2022 13.1341 9.81606C13.1341 8.42988 12.0104 7.30615 10.6242 7.30615C9.23798 7.30615 8.11426 8.42988 8.11426 9.81606C8.11426 11.2022 9.23798 12.326 10.6242 12.326Z"
                  stroke="#eefb75"
                  strokeWidth="1.2"
                />
              </svg>

              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/subscription-plan")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                Setting
              </p>
            </Link>

            {/* Help */}
            <Link
              onClick={() => setIsMobileOpen(false)}
              href="/super-admin/dashboard/help-support"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${
                isActive("/super-admin/dashboard/help-support")
                  ? "bg-[#4a5439]"
                  : "hover:bg-[#4a5439]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isCollapsed ? 28 : 20}
                height={isCollapsed ? 28 : 20}
                viewBox="0 0 20 20"
                fill="none"
                className={`${
                  isActive("/super-admin/dashboard/help-support")
                    ? "hidden"
                    : "block group-hover:hidden"
                }`}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.5 3C6.35791 3 3 6.35791 3 10.5C3 14.6421 6.35791 18 10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35791 14.6421 3 10.5 3ZM4.04651 10.5C4.04651 8.90651 4.62419 7.44767 5.5814 6.32163L7.81605 8.55558C7.40556 9.12071 7.18498 9.80152 7.18605 10.5C7.18498 11.1985 7.40556 11.8793 7.81605 12.4444L5.5814 14.6784C4.58773 13.5133 4.04334 12.0313 4.04651 10.5ZM8.55558 7.81605L6.32163 5.5814C7.48674 4.58773 8.96871 4.04334 10.5 4.04651C12.0935 4.04651 13.5523 4.62419 14.6784 5.5814L12.4437 7.81605C11.8788 7.4057 11.1982 7.18512 10.5 7.18605C9.80152 7.18498 9.12071 7.40556 8.55558 7.81605ZM6.32163 15.4186C7.48674 16.4123 8.96871 16.9567 10.5 16.9535C12.0313 16.9567 13.5133 16.4123 14.6784 15.4186L12.4437 13.184C11.8788 13.5943 11.1982 13.8149 10.5 13.814C9.80152 13.815 9.12071 13.5944 8.55558 13.184L6.32163 15.4186ZM13.184 12.4437L15.4186 14.6784C16.4123 13.5133 16.9567 12.0313 16.9535 10.5C16.9567 8.96871 16.4123 7.48674 15.4186 6.32163L13.184 8.55558C13.5944 9.12071 13.815 9.80152 13.814 10.5C13.815 11.1985 13.5944 11.8786 13.184 12.4437ZM8.23256 10.5C8.23256 9.89864 8.47145 9.3219 8.89668 8.89668C9.3219 8.47145 9.89864 8.23256 10.5 8.23256C11.1014 8.23256 11.6781 8.47145 12.1033 8.89668C12.5286 9.3219 12.7674 9.89864 12.7674 10.5C12.7674 11.1014 12.5286 11.6781 12.1033 12.1033C11.6781 12.5286 11.1014 12.7674 10.5 12.7674C9.89864 12.7674 9.3219 12.5286 8.89668 12.1033C8.47145 11.6781 8.23256 11.1014 8.23256 10.5Z"
                  fill="white"
                />
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isCollapsed ? 28 : 20}
                height={isCollapsed ? 28 : 20}
                viewBox="0 0 20 20"
                fill="none"
                className={`${
                  isActive("/super-admin/dashboard/help-support")
                    ? "block"
                    : "hidden group-hover:block"
                }`}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.5 3C6.35791 3 3 6.35791 3 10.5C3 14.6421 6.35791 18 10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35791 14.6421 3 10.5 3ZM4.04651 10.5C4.04651 8.90651 4.62419 7.44767 5.5814 6.32163L7.81605 8.55558C7.40556 9.12071 7.18498 9.80152 7.18605 10.5C7.18498 11.1985 7.40556 11.8793 7.81605 12.4444L5.5814 14.6784C4.58773 13.5133 4.04334 12.0313 4.04651 10.5ZM8.55558 7.81605L6.32163 5.5814C7.48674 4.58773 8.96871 4.04334 10.5 4.04651C12.0935 4.04651 13.5523 4.62419 14.6784 5.5814L12.4437 7.81605C11.8788 7.4057 11.1982 7.18512 10.5 7.18605C9.80152 7.18498 9.12071 7.40556 8.55558 7.81605ZM6.32163 15.4186C7.48674 16.4123 8.96871 16.9567 10.5 16.9535C12.0313 16.9567 13.5133 16.4123 14.6784 15.4186L12.4437 13.184C11.8788 13.5943 11.1982 13.8149 10.5 13.814C9.80152 13.815 9.12071 13.5944 8.55558 13.184L6.32163 15.4186ZM13.184 12.4437L15.4186 14.6784C16.4123 13.5133 16.9567 12.0313 16.9535 10.5C16.9567 8.96871 16.4123 7.48674 15.4186 6.32163L13.184 8.55558C13.5944 9.12071 13.815 9.80152 13.814 10.5C13.815 11.1985 13.5944 11.8786 13.184 12.4437ZM8.23256 10.5C8.23256 9.89864 8.47145 9.3219 8.89668 8.89668C9.3219 8.47145 9.89864 8.23256 10.5 8.23256C11.1014 8.23256 11.6781 8.47145 12.1033 8.89668C12.5286 9.3219 12.7674 9.89864 12.7674 10.5C12.7674 11.1014 12.5286 11.6781 12.1033 12.1033C11.6781 12.5286 11.1014 12.7674 10.5 12.7674C9.89864 12.7674 9.3219 12.5286 8.89668 12.1033C8.47145 11.6781 8.23256 11.1014 8.23256 10.5Z"
                  fill="#eefb75"
                />
              </svg>

              <p
                className={`font-normal text-[16px] leading-[20px] ${
                  isActive("/super-admin/dashboard/help-support")
                    ? "text-[#eefb75]"
                    : "text-[#ffffff] group-hover:text-[#eefb75]"
                } ${isCollapsed ? "hidden" : "block"}`}
              >
                Help & Support
              </p>
            </Link>
          </div>
        </div>

        {/* Collapse button outside scroll area - Now visible on mobile when sidebar is open */}
        <Image
          onClick={toggleCollapse}
          src="/images/narrow.png"
          alt="Collapse"
          width={28}
          height={32}
          className={`cursor-pointer hover:scale-110 h-auto w-auto transition-transform duration-500 top-[26px] fixed
          ${isCollapsed ? "left-[88px] rotate-180" : "left-[224px]"}
          ${isMobileOpen ? "lg:block block" : "lg:block hidden"}
          ${isSearchOpen ? "hidden" : "z-[2000]"}
          `}
        />
        {/* Spacer */}
        <div
          className={`${
            isCollapsed ? "w-[100px]" : "w-[266px]"
          } transition-all duration-300 ease-in-out hidden lg:block`}
        ></div>
      </div>
      <SearchDrawerShortcut setIsSearchOpen={setIsSearchOpen} />

      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        // data={allProperties} // your JSON array
      />
    </>
  );
}
