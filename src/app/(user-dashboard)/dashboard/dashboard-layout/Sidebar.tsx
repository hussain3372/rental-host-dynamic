

'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SearchDrawer from "@/app/shared/SearchDrawer";
import SearchDrawerShortcut from "@/app/shared/SearchDrawerShortcut";
import Cookies from 'js-cookie';
import { LogoutModal } from '../profile/LogoutModal';
import { useNotificationContext } from '@/app/shared/context/HostNotificaiton'; // Fixed spelling
import { useRouter } from 'next/navigation';
// import { allProperties } from "@/app/(main)/search-page/data/properties";
interface SidebarProps {
  onCollapseChange: (isCollapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

    const { notificationCount } = useNotificationContext();
  
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
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const router = useRouter()

    const handleLogout = () => {
    Cookies.remove("accessToken");
    localStorage.removeItem("userMfaEnabled");
    localStorage.removeItem("userRole");
    router.push("/auth/login");
  };
  
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

  const isActive = (route: string) => pathname === route;

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden w-fit flex items-center z-[100] justify-between px-4 py-6  fixed  ">
        <button onClick={toggleMobileMenu} className="text-white">
          <Menu size={28} />
        </button>
      </div>

      <div className="flex max-h-[100vh] bg-[#121315] relative">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={` pt-[24px] z-[100] bg-[#121315] mt-0  sm:mt-0 px-[20px] ${isCollapsed ? 'flex items-center w-[100px]' : 'w-[266px]'
            } border-r h-[100vh] overflow-y-auto scrollbar-hide  overflow-x-hidden border-r-[#222325] fixed flex flex-col
          transition-all duration-300 ease-in-out z-30
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0`}
        >
          {/* Header */}
          <Link onClick={() => { setIsMobileOpen(false) }} href="/dashboard" className="justify-between items-center mb-[48px] flex">
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
                  ''
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
                        ''
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
                        ''
                        } absolute transition-opacity`}
                    />
                  </div>
                  <p
                    className={`font-normal text-[16px] leading-[20px] text-[#ffffff] transition-colors 
          ${isCollapsed ? 'hidden' : 'block'} 
          ${
                      // 'group-hover:text-[#eefb75]'
                      // isActive('/search') ? 'text-[#eefb75]' : 
                      ''
                      }`}
                  >
                    Search
                  </p>
                </div>

                <div className={`flex gap-[4px] ${isCollapsed ? 'hidden' : 'block'}`}>
                  <div className="w-[20px] h-[20px] bg-[#3f4041] rounded-[3px] border-b border-b-white flex items-center justify-center">
                    <span className="text-[#ffffff] text-[10px] font-normal">K</span>
                  </div>
                </div>
              </button>
            </div>



            {/* Notifications */}
            <Link
              onClick={() => setIsMobileOpen(false)}
              href="/dashboard/notifications"
              className={`flex justify-between items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 ${isActive("/dashboard/notifications") ? "bg-[#4a5439]" : "hover:bg-[#4a5439]"
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
                  className={`transition-colors ${isActive("/dashboard/notifications")
                    ? "fill-[#eefb75]" // active color
                    : "fill-white group-hover:fill-[#eefb75]" // inactive + hover
                    }`}
                >
                  <path d="M11.232 0.989679C11.0447 1.38447 10.9474 1.81598 10.9474 2.25297H2.31579C1.73474 2.25297 1.26316 2.7246 1.26316 3.30571V13.8331C1.26316 14.4143 1.73474 14.8859 2.31579 14.8859H12.8421C13.4232 14.8859 13.8947 14.4143 13.8947 13.8331V5.20233C14.3469 5.20233 14.7756 5.10043 15.1587 4.91851L15.1579 13.8331C15.1579 14.4474 14.9139 15.0365 14.4796 15.4708C14.0453 15.9052 13.4563 16.1492 12.8421 16.1492H2.31579C1.7016 16.1492 1.11257 15.9052 0.678279 15.4708C0.243984 15.0365 0 14.4474 0 13.8331V3.30571C0 2.69146 0.243984 2.10237 0.678279 1.66803C1.11257 1.23369 1.7016 0.989679 2.31579 0.989679H11.232ZM13.8947 0.14917C14.4531 0.14917 14.9886 0.370997 15.3834 0.765852C15.7782 1.16071 16 1.69625 16 2.25465C16 2.81306 15.7782 3.3486 15.3834 3.74346C14.9886 4.13831 14.4531 4.36014 13.8947 4.36014C13.3364 4.36014 12.8009 4.13831 12.4061 3.74346C12.0113 3.3486 11.7895 2.81306 11.7895 2.25465C11.7895 1.69625 12.0113 1.16071 12.4061 0.765852C12.8009 0.370997 13.3364 0.14917 13.8947 0.14917Z" />
                </svg>

                {/* Text with same color logic */}
                <p
                  className={`font-normal text-[16px] leading-[20px] ${isActive("/dashboard/notifications")
                    ? "text-[#eefb75]"
                    : "text-white group-hover:text-[#eefb75]"
                    } ${isCollapsed ? "hidden" : "block"}`}
                >
                  Notifications
                </p>
              </div>

              <div
                className={`w-[20px] h-[20px] bg-[#D84725] rounded-[4px] border-b border-b-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${isCollapsed ? "hidden" : "flex"
                  }`}
              >
                 <span className="text-white text-[10px] font-medium">
                  {" "}
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
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
              href="/dashboard"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${isActive("/dashboard") ? "bg-[#4a5439]" : "hover:bg-[#4a5439]"
                }`}
            >
              <div className="relative w-[20px] h-[20px]">
                {/* Default (inactive) SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  className={`opacity-100 group-hover:opacity-0 absolute transition-opacity ${isActive("/dashboard") ? "hidden" : ""
                    }`}
                >
                  <path
                    d="M7.48699 17.3683H4.74533C3.73533 17.3683 2.91699 16.55 2.91699 15.54V10.1616C2.91761 9.76983 3.00194 9.38268 3.16435 9.02611C3.32675 8.66954 3.56347 8.35179 3.85866 8.09414L8.80033 3.78998C9.13309 3.5005 9.55927 3.34106 10.0003 3.34106C10.4414 3.34106 10.8676 3.5005 11.2003 3.78998L16.142 8.09498C16.4371 8.35253 16.6737 8.67014 16.8361 9.02656C16.9985 9.38298 17.0829 9.76997 17.0837 10.1616V15.54C17.0837 16.0247 16.8911 16.4897 16.5484 16.8325C16.2057 17.1754 15.7409 17.3681 15.2562 17.3683H12.742V11.8841C12.742 11.1275 12.1287 10.5133 11.3712 10.5133H8.85866C8.10116 10.5133 7.48783 11.1275 7.48783 11.8841L7.48699 17.3683ZM7.48699 17.3683H12.7428"
                    stroke="white"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Active / Hover SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  className={`opacity-0 group-hover:opacity-100 absolute transition-opacity ${isActive("/dashboard") ? "opacity-100" : ""
                    }`}
                >
                  <path
                    d="M7.48699 17.3683H4.74533C3.73533 17.3683 2.91699 16.55 2.91699 15.54V10.1616C2.91761 9.76983 3.00194 9.38268 3.16435 9.02611C3.32675 8.66954 3.56347 8.35179 3.85866 8.09414L8.80033 3.78998C9.13309 3.5005 9.55927 3.34106 10.0003 3.34106C10.4414 3.34106 10.8676 3.5005 11.2003 3.78998L16.142 8.09498C16.4371 8.35253 16.6737 8.67014 16.8361 9.02656C16.9985 9.38298 17.0829 9.76997 17.0837 10.1616V15.54C17.0837 16.0247 16.8911 16.4897 16.5484 16.8325C16.2057 17.1754 15.7409 17.3681 15.2562 17.3683H12.742V11.8841C12.742 11.1275 12.1287 10.5133 11.3712 10.5133H8.85866C8.10116 10.5133 7.48783 11.1275 7.48783 11.8841L7.48699 17.3683ZM7.48699 17.3683H12.7428"
                    stroke="#eefb75"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p
                className={`font-normal text-[16px] leading-[20px] ${isActive("/dashboard")
                  ? "text-[#eefb75]"
                  : "text-[#ffffff] group-hover:text-[#eefb75]"
                  } ${isCollapsed ? "hidden" : "block"}`}
              >
                Home
              </p>
            </Link>


            {/* Applications */}
            <Link onClick={() => { setIsMobileOpen(false) }}
              href="/dashboard/application"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${isActive('/dashboard/application') || isActive('/dashboard/application/detail/[id]')
                ? 'bg-[#4a5439] text-[#EFFC76]'
                : 'hover:bg-[#4a5439]'
                }`}
            >
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src="/images/applications.png"
                  alt="Applications"
                  width={isCollapsed ? 28 : 20}
                  height={isCollapsed ? 28 : 20}
                  className={`opacity-100 group-hover:opacity-0 absolute transition-opacity ${isActive('/dashboard/application') ? 'opacity-0' : ''
                    }`}
                />
                <Image
                  src="/images/application-yellow.png"
                  alt="Applications"
                  width={isCollapsed ? 28 : 20}
                  height={isCollapsed ? 28 : 20}
                  className={`opacity-0 group-hover:opacity-100 absolute transition-opacity ${isActive('/dashboard/application') ? 'opacity-100' : ''
                    }`}
                />
              </div>
              <p
                className={`font-normal text-[16px] leading-[20px] ${isActive('/dashboard/application')
                  ? 'text-[#eefb75]'
                  : 'text-[#ffffff] group-hover:text-[#eefb75]'
                  } ${isCollapsed ? 'hidden' : 'block'}`}
              >
                My Applications
              </p>
            </Link>

            {/* Certificates */}
            <Link onClick={() => { setIsMobileOpen(false) }}
              href="/dashboard/certificates"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${isActive('/dashboard/certificates')
                ? 'bg-[#4a5439]'
                : 'hover:bg-[#4a5439]'
                }`}
            >
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src="/images/certificates.png"
                  alt="Certificates"
                  width={isCollapsed ? 28 : 20}
                  height={isCollapsed ? 28 : 20}
                  className={`opacity-100 group-hover:opacity-0 absolute transition-opacity ${isActive('/dashboard/certificates') ? 'opacity-0' : ''
                    }`}
                />
                <Image
                  src="/images/certificates-yellow.png"
                  alt="Certificates"
                  width={isCollapsed ? 28 : 20}
                  height={isCollapsed ? 28 : 20}
                  className={`opacity-0 group-hover:opacity-100 absolute transition-opacity ${isActive('/dashboard/certificates') ? 'opacity-100' : ''
                    }`}
                />
              </div>
              <p
                className={`font-normal text-[16px] leading-[20px] ${isActive('/dashboard/certificates')
                  ? 'text-[#eefb75]'
                  : 'text-[#ffffff] group-hover:text-[#eefb75]'
                  } ${isCollapsed ? 'hidden' : 'block'}`}
              >
                My Certificates
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
              href="/dashboard/subscription-plan"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${isActive("/dashboard/subscription-plan")
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
                className={`opacity-100 group-hover:hidden ${isActive("/dashboard/subscription-plan") ? "hidden" : "block"
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
                className={`${isActive("/dashboard/subscription-plan")
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
                className={`font-normal text-[16px] leading-[20px] ${isActive("/dashboard/subscription-plan")
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
              href="/dashboard/help-support"
              className={`flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] ${isActive("/dashboard/help-support")
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
                className={`${isActive("/dashboard/help-support") ? "hidden" : "block group-hover:hidden"}`}
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
                className={`${isActive("/dashboard/help-support") ? "block" : "hidden group-hover:block"}`}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.5 3C6.35791 3 3 6.35791 3 10.5C3 14.6421 6.35791 18 10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35791 14.6421 3 10.5 3ZM4.04651 10.5C4.04651 8.90651 4.62419 7.44767 5.5814 6.32163L7.81605 8.55558C7.40556 9.12071 7.18498 9.80152 7.18605 10.5C7.18498 11.1985 7.40556 11.8793 7.81605 12.4444L5.5814 14.6784C4.58773 13.5133 4.04334 12.0313 4.04651 10.5ZM8.55558 7.81605L6.32163 5.5814C7.48674 4.58773 8.96871 4.04334 10.5 4.04651C12.0935 4.04651 13.5523 4.62419 14.6784 5.5814L12.4437 7.81605C11.8788 7.4057 11.1982 7.18512 10.5 7.18605C9.80152 7.18498 9.12071 7.40556 8.55558 7.81605ZM6.32163 15.4186C7.48674 16.4123 8.96871 16.9567 10.5 16.9535C12.0313 16.9567 13.5133 16.4123 14.6784 15.4186L12.4437 13.184C11.8788 13.5943 11.1982 13.8149 10.5 13.814C9.80152 13.815 9.12071 13.5944 8.55558 13.184L6.32163 15.4186ZM13.184 12.4437L15.4186 14.6784C16.4123 13.5133 16.9567 12.0313 16.9535 10.5C16.9567 8.96871 16.4123 7.48674 15.4186 6.32163L13.184 8.55558C13.5944 9.12071 13.815 9.80152 13.814 10.5C13.815 11.1985 13.5944 11.8786 13.184 12.4437ZM8.23256 10.5C8.23256 9.89864 8.47145 9.3219 8.89668 8.89668C9.3219 8.47145 9.89864 8.23256 10.5 8.23256C11.1014 8.23256 11.6781 8.47145 12.1033 8.89668C12.5286 9.3219 12.7674 9.89864 12.7674 10.5C12.7674 11.1014 12.5286 11.6781 12.1033 12.1033C11.6781 12.5286 11.1014 12.7674 10.5 12.7674C9.89864 12.7674 9.3219 12.5286 8.89668 12.1033C8.47145 11.6781 8.23256 11.1014 8.23256 10.5Z"
                  fill="#eefb75"
                />
              </svg>

              <p
                className={`font-normal text-[16px] leading-[20px] ${isActive("/dashboard/help-support")
                  ? "text-[#eefb75]"
                  : "text-[#ffffff] group-hover:text-[#eefb75]"
                  } ${isCollapsed ? "hidden" : "block"}`}
              >
                Help & Support
              </p>
            </Link>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`flex gap-[8px] w-full items-center px-[12px] py-[8px] rounded-[6px] cursor-pointer group transition-all duration-200 mb-[16px] hover:bg-[#4a5439]`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isCollapsed ? 28 : 20}
                height={isCollapsed ? 28 : 20}
                viewBox="0 0 20 20"
                fill="none"
                className={`stroke-white group-hover:stroke-[#eefb75]`}
              >
                <path
                  d="M5.83333 2.5C5.05833 2.5 4.67083 2.5 4.35333 2.585C3.92927 2.69854 3.54259 2.92175 3.23217 3.23217C2.92175 3.54259 2.69854 3.92927 2.585 4.35333C2.5 4.67083 2.5 5.05833 2.5 5.83333V14.1667C2.5 14.9417 2.5 15.3292 2.585 15.6467C2.69854 16.0707 2.92175 16.4574 3.23217 16.7678C3.54259 17.0783 3.92927 17.3015 4.35333 17.415C4.67083 17.5 5.05833 17.5 5.83333 17.5M13.75 13.75C13.75 13.75 17.5 10.9883 17.5 10C17.5 9.01167 13.75 6.25 13.75 6.25M16.6667 10H6.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p
                className={`font-normal text-[16px] leading-[20px] group-hover:text-[#eefb75] ${isCollapsed ? "hidden" : "block"}`}
              >
                Logout
              </p>
            </button>
          </div>
        </div>

        {/* Collapse button outside scroll area - Now visible on mobile when sidebar is open */}
        <Image
          onClick={toggleCollapse}
          src="/images/narrow.png"
          alt="Collapse"
          width={28}
          height={32}
          className={`cursor-pointer hover:scale-110 h-auto transition-transform duration-500 top-[26px] fixed
          ${isCollapsed ? "left-[88px] rotate-180" : "left-[224px]"}
          ${isMobileOpen ? "lg:block block" : "lg:block hidden"}
          ${isSearchOpen ? "hidden" : "z-[10000]"}
          `}
        />
        {/* Spacer */}
        <div
          className={`${isCollapsed ? 'w-[100px]' : 'w-[266px]'
            } transition-all duration-300 ease-in-out hidden lg:block`}
        ></div>
      </div>
      <SearchDrawerShortcut setIsSearchOpen={setIsSearchOpen} />

      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        // data={allProperties} // your JSON array
      />

      <LogoutModal
              isOpen={isLogoutModalOpen}
              onClose={() => setIsLogoutModalOpen(false)}
              onConfirm={handleLogout}
            />

    </>

  );
}