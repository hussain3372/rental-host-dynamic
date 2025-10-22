"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TicketDrawer from './TicketDrawer';

export default function Navbar() {
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
const [isVisible, setIsVisible] = useState(false);

const openDrawer = () => {
  setIsVisible(true);
  setTimeout(() => setIsOpen(true), 10); // Small delay for CSS
};

const closeDrawer = () => {
  setIsOpen(false);
  setTimeout(() => setIsVisible(false), 300); // Match transition duration
};

  return (
    <>
      <nav className='text-white fixed z-50 w-full bg-[#0A0C0B] border-b border-b-white/20'>
        <div className='px-4 sm:px-10 py-[18px] flex justify-between items-center'>
          <Link href="/dashboard">
            <Image src="/images/pricing-logo.png" alt='Logo' width={181} height={35} />
          </Link>
         
          <div 
            className="flex gap-2 items-center cursor-pointer"
            onClick={openDrawer} // Add click handler to open drawer
          >
            <Image src="/images/assistance.png" alt='Help' height={24} width={25} />
            <p className='text-white/40 hover:text-white font-semibold leading-[18px] text-[14px]'>Help Assistance</p>
          </div>
        </div>
      </nav>

      {/* Conditionally render the drawer with overlay */}
      {isVisible && (
  <div className="fixed inset-0 z-50 flex">
    {/* Overlay with fade */}
    <div 
      className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={closeDrawer}
    />
    
    {/* Drawer with slide */}
    <div 
      className={`relative z-10 prevent-scroller max-w-[280px] sm:max-w-[608px] p-[28px] ml-auto h-full overflow-y-scroll bg-[#121315] transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <TicketDrawer onClose={closeDrawer} />
    </div>
  </div>
)}
    </>
  );
}