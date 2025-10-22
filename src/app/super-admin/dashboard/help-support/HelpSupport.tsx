"use client";

import React, { useState } from "react";
import Tabs from "./Tabs";
import Ticket from "./Ticket";
import Announcements from "./Announcements";
import HelpSupportDrawer from "./HelpSupportDrawer";
import TicketDetailDrawer from "./TicketDetailDrawer";
import { Modal } from "@/app/shared/Modal";
import AddAnnouncementsDrawer from "./NewAnnouncement";

interface CertificationData {
  id: number;
  "Ticket Id": string;
  "Issue Type": string;
  Subject: string;
  "Host Name"?: string;
  "Created On": string;
  Status: string;
}

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openAnnounce, setOpenAnnounce] = useState(false);
  const itemsPerPage = 6;

  // Modal and drawer statesa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] =
    useState<CertificationData | null>(null);

  // Handle view details from both tables
  const handleViewDetails = (ticket: CertificationData) => {
    setSelectedTicket(ticket);
    setIsDetailDrawerOpen(true);
  };

  // Handle tab content rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case "tickets":
        return (
          <Ticket
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            isFilterOpen={isFilterOpen}
            onFilterToggle={setIsFilterOpen}
            onViewDetails={handleViewDetails}
          />
        );
      case "announcements":
        return <Announcements />;
      default:
        return null;
    }
  };

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => setIsModalOpen(false)}
          title="Confirm Action"
          description="This is a placeholder for modal actions."
          image="/images/delete-modal.png"
          confirmText="Confirm"
        />
      )}

      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[20px] leading-[24px] font-semibold text-white mb-2">
            Help & Support
          </h1>
          <p className="text-[16px] leading-[20px] text-[#FFFFFF99] font-regular max-w-[573px]">
            Manage your support tickets and stay informed with system
            announcements.
          </p>
        </div>
      </div>

      {/* Tabs Component */}
      <div className="mb-6 flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between items-center">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "announcements" && (
          <button
            onClick={() => setOpenAnnounce(true)}
            className="font-semibold  text-[16px] leading-5 yellow-btn px-5 py-3 text-black"
          >
            Create New Announcement
          </button>
        )}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Create Ticket Drawer */}
      <div
        className={`fixed inset-0 bg-[#121315CC] z-[3000000000] flex justify-end transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpSupportDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        </div>
      </div>

      {/* Ticket Detail Drawer */}
      <div
        className={`fixed inset-0 bg-[#121315CC] z-[3000000001] flex justify-end transition-opacity duration-300 ${
          isDetailDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDetailDrawerOpen(false)}
      >
        <div
          className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] bg-[#0A0C0B] h-full flex flex-col rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
            isDetailDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <TicketDetailDrawer
              isOpen={isDetailDrawerOpen}
              onClose={() => setIsDetailDrawerOpen(false)}
              ticket={
                selectedTicket
                  ? {
                      id: String(selectedTicket.id),
                      ticketId: selectedTicket["Ticket Id"],
                      issueType: selectedTicket["Issue Type"],
                      subject: selectedTicket["Subject"],
                      createdOn: selectedTicket["Created On"],
                      status: selectedTicket["Status"],
                    }
                  : null
              }
            />
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-[#121315CC] z-[3000000002] flex justify-end transition-opacity duration-300 ${
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
    </>
  );
}