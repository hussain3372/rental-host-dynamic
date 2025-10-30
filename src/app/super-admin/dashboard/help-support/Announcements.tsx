"use client";
import { Modal } from "@/app/shared/Modal";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import AddAnnouncementsDrawer from "./NewAnnouncement";
import PlatformDrawer from "./PlatformUpdates";
import Dropdown from "@/app/shared/Dropdown";
import { supportApi } from "@/app/api/super-admin/support";
import { PlatformAnnouncement } from "./PlatformUpdates";

interface AnnouncementsProps {
  refresh: boolean;
}

export interface SupportAnnouncement {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export default function Announcements({ refresh }: AnnouncementsProps) {
  const [openAnnounce, setOpenAnnounce] = useState(false);
  const [openPlatForm, setOpenPlatform] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<SupportAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supportApi.getAnnouncements();
      
      console.log("🔵 Announcements API Response:", response);
      
      if (response.data?.data) {
        const announcementsData: SupportAnnouncement[] = response.data.data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          imageUrl: item.imageUrl,
          tags: item.tags,
          createdBy: item.createdBy,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        
        setAnnouncements(announcementsData);
        console.log("🟢 Processed announcements:", announcementsData);
      } else {
        console.log("🟡 No announcements data found in response");
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("🔴 Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements, refresh]);

  // Handle delete announcement
  const handleDelete = async (id: string) => {
    try {
      await supportApi.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(announcement => announcement.id !== id));
      setCardToDelete(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  // Handle create announcement success
  const handleAnnouncementSuccess = () => {
    fetchAnnouncements(); // Refresh the list
    setOpenAnnounce(false);
  };

  // Handle announcement update
  // In Announcements component
const handleAnnouncementUpdate = (updatedAnnouncement: PlatformAnnouncement) => {
  // Convert PlatformAnnouncement to SupportAnnouncement
  const supportAnnouncement: SupportAnnouncement = {
    ...updatedAnnouncement,
    date: new Date(updatedAnnouncement.updatedAt || Date.now()).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAt: updatedAnnouncement.updatedAt || new Date().toISOString(),
    updatedAt: updatedAnnouncement.updatedAt || new Date().toISOString(),
    // Add any other required fields with default values
  };
  
  setAnnouncements(prev => 
    prev.map(announcement => 
      announcement.id === supportAnnouncement.id ? supportAnnouncement : announcement
    )
  );
  setOpenPlatform(false);
  setSelectedAnnouncementId(null);
};

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const openDeleteModal = (id: string) => {
    setCardToDelete(id);
    setOpenMenuId(null);
  };

  const closeDeleteModal = () => {
    setCardToDelete(null);
  };

  // Open platform drawer with specific announcement
  const openPlatformDrawer = (announcementId: string) => {
    setSelectedAnnouncementId(announcementId);
    setOpenPlatform(true);
  };

  // Close platform drawer
  const closePlatformDrawer = () => {
    setOpenPlatform(false);
    setSelectedAnnouncementId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-[#121315] rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-5"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {announcements.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-400 text-lg">No announcements found</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                onClick={() => openPlatformDrawer(announcement.id)}
                className="bg-[#121315] cursor-pointer rounded-lg p-6 relative"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-white text-lg font-medium mb-5">
                    {announcement.title}
                  </h3>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleMenu(announcement.id);
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Dropdown
                        isOpen={openMenuId === announcement.id}
                        onClose={() => setOpenMenuId(null)}
                        items={[
                          {
                            label: "Edit",
                            onClick: () => openPlatformDrawer(announcement.id),
                          },
                          {
                            label: "Delete",
                            onClick: () => openDeleteModal(announcement.id),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[#FFFFFF66] text-[16px] leading-5 mb-5">
                  {announcement.description}
                </p>

                <div className="flex items-center gap-2">
                  <Image
                    src="/images/clock.svg"
                    alt="Open drawer"
                    height={16}
                    width={16}
                  />
                  <span className="text-[#FFFFFF99] text-[14px] leading-[18px] font-regular">
                    {announcement.date}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Modal */}
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

      {/* Add Announcement Drawer */}
      <div
        className={`fixed inset-0 bg-[#121315CC] z-[20000] flex justify-end transition-opacity duration-300 ${
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
            onSuccess={handleAnnouncementSuccess}
          />
        </div>
      </div>

      {/* Platform Updates Drawer */}
      <div
        className={`fixed inset-0 bg-[#121315CC] z-[2000] flex justify-end transition-opacity duration-300 ${
          openPlatForm ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePlatformDrawer}
      >
        <div
          className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
            openPlatForm ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <PlatformDrawer
            isOpen={openPlatForm}
            onClose={closePlatformDrawer}
            announcementId={selectedAnnouncementId||""}
            onUpdate={handleAnnouncementUpdate}
          />
        </div>
      </div>
    </>
  );
}