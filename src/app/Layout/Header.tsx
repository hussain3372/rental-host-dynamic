"use client";
import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const token = Cookies.get('accessToken')

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = ["home", "plans", "how-it-works", "hosts"];

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      let maxRatio = 0;
      let maxEntry: IntersectionObserverEntry | null = null;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          maxEntry = entry;
        }
      }
      if (maxEntry && maxEntry.target) {
        const targetElement = maxEntry.target as HTMLElement;
        const id = targetElement.id;
        setActiveSection(id);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20% 0px -20% 0px",
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    });

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["plans", "how-it-works", "hosts"].includes(hash)) {
        setActiveSection(hash);
      } else if (pathname === "/" && !hash) {
        setActiveSection("home");
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);
  const linkClasses = (isActive: boolean) =>
    `text-[20px] cursor-pointer pro-medium leading-5 relative group transition-colors duration-300
     ${isActive ? "text-[#FFFFFF]" : "text-[#FFFFFF99]"} hover:text-[#FFFFFF]`;
  const isSectionActive = (section: string) => {
    return activeSection === section;
  };
  // Handle manual click on navigation links
  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        const elementTop =
          element.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({
          top: elementTop,
          behavior: "smooth",
        });
      }
    }, 10);
  };
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#17181A] px-[0px] md:px-[89px] shadow-md">
        <div className="bg-[#0A0C0B] rounded-lg relative w-full max-w-[1304px] mx-auto">
          <nav className="mx-auto flex items-center justify-between py-[24px] px-3 sm:px-[20px]">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#FFFFFF99] lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <Link href="/" className="-m-1.5 p-1.5 block sm:hidden">
                <Image
                  src="/images/auth-logo.png"
                  width={37}
                  height={13}
                  alt="logo"
                />
              </Link>
            </div>
            {/* Logo with text */}
            <div className="hidden sm:flex lg:flex-1">
              <Link href="/" className="flex items-center gap-2 -m-1.5 p-1.5">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={181}
                  height={35}
                  className="w-[181px] h-auto"
                />
              </Link>
            </div>
            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:gap-x-8 px-5 py-3 items-center relative">
              <Link
                href="/"
                className={linkClasses(isSectionActive("home"))}
                onClick={() => handleNavClick("home")}
              >
                Home
              </Link>
              <Link
                href="/#plans"
                className={linkClasses(isSectionActive("plans"))}
                onClick={() => handleNavClick("plans")}
              >
                Pricing
              </Link>
              <Link
                href="/#how-it-works"
                className={linkClasses(isSectionActive("how-it-works"))}
                onClick={() => handleNavClick("how-it-works")}
              >
                How It Works
              </Link>
              <Link
                href="/#hosts"
                className={linkClasses(isSectionActive("hosts"))}
                onClick={() => handleNavClick("hosts")}
              >
                Our Hosts
              </Link>
            </div>
            {/* CTA Buttons */}
            <div className="flex gap-3 lg:flex-1 lg:justify-end">
              
              <Link
                href="/auth/login"
                className="text-[16px] font-medium leading-5 flex items-center transition-all duration-300
                bg-[#fff] rounded-[8px] h-[30px] pt-[6px] pb-[6px] pl-[12px] pr-[12px] gap-[4px]
                lg:h-[36px] lg:pt-[8px] lg:pb-[8px] lg:pl-[24px] lg:pr-[24px] lg:gap-[8px] text-black"
              >
                Sign in
              </Link>
            </div>
          </nav>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5">
                  <Image
                    src="/images/logo.png"
                    width={80}
                    height={40}
                    alt="logo"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6 text-[#FFFFFF99]" />
                </button>
              </div>
              <div className="mt-6">
                <div className="space-y-4">
                  <Link
                    href="/"
                    className={`block text-base px-3 py-2 transition-colors duration-300 ${
                      isSectionActive("home")
                        ? "text-[#FFFFFF]"
                        : "text-[#FFFFFF99] hover:text-[#FFFFFF]"
                    }`}
                    onClick={() => {
                      handleNavClick("home");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    href="/#plans"
                    className={`block text-base px-3 py-2 transition-colors duration-300 ${
                      isSectionActive("plans")
                        ? "text-[#FFFFFF]"
                        : "text-[#FFFFFF99] hover:text-[#FFFFFF]"
                    }`}
                    onClick={() => {
                      handleNavClick("plans");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/#how-it-works"
                    className={`block text-base px-3 py-2 transition-colors duration-300 ${
                      isSectionActive("how-it-works")
                        ? "text-[#FFFFFF]"
                        : "text-[#FFFFFF99] hover:text-[#FFFFFF]"
                    }`}
                    onClick={() => {
                      handleNavClick("how-it-works");
                      setMobileMenuOpen(false);
                    }}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/#hosts"
                    className={`block text-base px-3 py-2 transition-colors duration-300 ${
                      isSectionActive("hosts")
                        ? "text-[#FFFFFF]"
                        : "text-[#FFFFFF99] hover:text-[#FFFFFF]"
                    }`}
                    onClick={() => {
                      handleNavClick("hosts");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Our Hosts
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="h-[112px] lg:h-[112px]"></div>
    </>
  );
}
