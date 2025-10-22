"use client";
import { Modal } from "@/app/shared/Modal";
import Image from "next/image";
import React, { useState} from "react";
import AddAnnouncementsDrawer from "./NewAnnouncement";
import PlatformDrawer from "./PlatformUpdates";
import Dropdown from "@/app/shared/Dropdown";

interface UpdateCard {
  id: number;
  title: string;
  description: string;
  date: string;
}


export default function Announcements() {
    const [openAnnounce, setOpenAnnounce] = useState(false);
    const [openPlatForm, setOpenPlatform] = useState(false);

  const [cards, setCards] = useState<UpdateCard[]>([
    {
      id: 1,
      title: "Platform Updates",
      description: "Stay informed about the latest features, ongoing improvements, important service updates, and changes that help you get the best out of the platform.",
      date: "Aug 12, 2025"
    },
    {
      id: 2,
      title: "Platform Updates",
      description: "Stay informed about the latest features, ongoing improvements, important service updates, and changes that help you get the best out of the platform.",
      date: "Aug 12, 2025"
    },
    {
      id: 3,
      title: "Platform Updates",
      description: "Stay informed about the latest features, ongoing improvements, important service updates, and changes that help you get the best out of the platform.",
      date: "Aug 12, 2025"
    },
    {
      id: 4,
      title: "Platform Updates",
      description: "Stay informed about the latest features, ongoing improvements, important service updates, and changes that help you get the best out of the platform.",
      date: "Aug 12, 2025"
    },
    {
      id: 5,
      title: "Platform Updates",
      description: "Stay informed about the latest features, ongoing improvements, important service updates, and changes that help you get the best out of the platform.",
      date: "Aug 12, 2025"
    },
    {
      id: 6,
      title: "Platform Updates",
      description: "Stay informed about the latest features, ongoing improvements, important service updates, and changes that help you get the best out of the platform.",
      date: "Aug 12, 2025"
    }
  ]);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setCards(cards.filter(card => card.id !== id));
    setCardToDelete(null);
    setOpenMenuId(null);
  };

  

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const openDeleteModal = (id: number) => {
    setCardToDelete(id);
    setOpenMenuId(null);
  };

  const closeDeleteModal = () => {
    setCardToDelete(null);
  };

  

  return (
    <>
    <div className="min-h-screen bg-black pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {cards.map((card) => (
<div
  key={card.id}
  onClick={() => {
    setOpenPlatform(true);
  }}
  className="bg-[#121315] cursor-pointer rounded-lg p-6 relative"
>
  <div className="flex justify-between items-start">
    <h3 className="text-white text-lg font-medium mb-5">
      {card.title}
    </h3>

    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          toggleMenu(card.id);
        }}
        className="text-gray-400 cursor-pointer hover:text-white p-2"
      >
        <Image
          src="/images/vertical-menu.svg"
          alt="Open dropdown"
          height={20}
          width={20}
        />
      </button>

      {/* Dropdown menu */}
     <div
  className="absolute left-30 top-30"
  onClick={(e) => e.stopPropagation()} // 🧠 This line blocks bubbling to the card
>
  <Dropdown
    isOpen={openMenuId === card.id}
    onClose={() => setOpenMenuId(null)}
    items={[
      {
        label: "Edit",
        onClick: () => setOpenAnnounce(true),
      },
      {
        label: "Delete",
        onClick: () => openDeleteModal(card.id),
      },
    ]}
  />
</div>

  </div>
  </div>

  <p className="text-[#FFFFFF66] text-[16px] leading-5 mb-5">
    {card.description}
  </p>

  <div className="flex items-center gap-2">
    <Image
      src="/images/clock.svg"
      alt="Open drawer"
      height={16}
      width={16}
    />
    <span className="text-[#FFFFFF99] text-[14px] leading-[18px] font-regular">
      {card.date}
    </span>
  </div>
</div>

        ))}
      </div>

      {/* Delete Modal - rendered once but connected to specific card */}
      <Modal 
        isOpen={cardToDelete !== null} 
        onClose={closeDeleteModal} 
        title="Delete Announcement" 
        description="Are you sure you want to delete this announcement? Once deleted, it cannot be restored and will no longer be visible to users." 
        image="/images/delete-announcement.png" 
        confirmText="Delete Announcement" 
        onConfirm={() => cardToDelete && handleDelete(cardToDelete)} 
      />
    </div>

    <div
            className={`fixed inset-0 bg-[#121315CC]  flex justify-end transition-opacity duration-300 ${
              openAnnounce ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setOpenAnnounce(false)}
          >
            <div
              className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
                openAnnounce ? "translate-x-0" : "translate-x-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <AddAnnouncementsDrawer
                isOpen={openAnnounce}
                onClose={() => setOpenAnnounce(false)}
              />
            </div>
          </div>
          <div
  className={`fixed inset-0 bg-[#121315CC] z-[2000] flex justify-end transition-opacity duration-300 ${
    openAnnounce ? "opacity-100" : "opacity-0 pointer-events-none"
  }`}
  onClick={() => setOpenAnnounce(false)} // This is correct
>
  <div
    className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
      openAnnounce ? "translate-x-0" : "translate-x-full"
    }`}
    onClick={(e) => e.stopPropagation()} // This prevents closing when clicking inside
  >
    <AddAnnouncementsDrawer
      isOpen={openAnnounce}
      onClose={() => setOpenAnnounce(false)}
    />
  </div>
</div>

<div
  className={`fixed inset-0 bg-[#121315CC] z-[2000] flex justify-end transition-opacity duration-300 ${
    openPlatForm ? "opacity-100" : "opacity-0 pointer-events-none"
  }`}
  onClick={() => setOpenPlatform(false)} // Fixed: was setOpenAnnounce(false)
>
  <div
    className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
      openPlatForm ? "translate-x-0" : "translate-x-full"
    }`}
    onClick={(e) => e.stopPropagation()} // This prevents closing when clicking inside
  >
    <PlatformDrawer
      isOpen={openPlatForm}
      onClose={() => setOpenPlatform(false)}
    />
  </div>
</div>
    </>
  );
}