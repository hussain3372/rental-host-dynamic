"use client";

import React, { useState } from "react";
import Tabs from "./Tabs";
import Ticket from "./Ticket";
import Announcements from "./Announcements";
import HelpSupportDrawer from "./HelpSupportDrawer";
import TicketDetailDrawer from "./TicketDetailDrawer";
import { Modal } from "@/app/shared/Modal";
import AddAnnouncementsDrawer from "./NewAnnouncement";
import { Ticket as ApiTicket } from "@/app/api/Admin/support/types";
import { supportApi } from "@/app/api/super-admin/support";
import HostTickets from "./HostTickets";
interface CertificationData {
  id: number;
  "Ticket Id": string;
  "Issue Type": string;
  Subject: string;
  "Host Name"?: string;
  "Created On": string;
  Status: string;
}

// Define the API response structure
interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiTicket;
}

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState("tickets");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openAnnounce, setOpenAnnounce] = useState(false);
  const [refreshAnnouncements, setRefreshAnnouncements] = useState(false);

  const itemsPerPage = 6;

  // Modal and drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const handleViewDetails = async (ticket: CertificationData) => {
    console.log("🟡 Fetching ticket details for:", ticket["Ticket Id"]);
    setLoadingTicket(true);
    setIsDetailDrawerOpen(true);

    try {
      const response = await supportApi.getTicketById(ticket["Ticket Id"]);
      console.log("🔵 Full API Response:", response);

      // ✅ FIXED: Debug the response structure with proper typing
      console.log("🔵 Response.data:", response.data);
      console.log("🔵 Response.data type:", typeof response.data);

      let ticketData: ApiTicket | null = null;

      // If response.data is the nested structure {success, message, data}
      if (response.data && typeof response.data === "object") {
        const apiData = response.data as ApiResponse | ApiTicket;

        // Check if it has the nested structure (ApiResponse)
        if ("success" in apiData && apiData.success && apiData.data) {
          ticketData = apiData.data;
          console.log("✅ Found nested structure, ticket data:", ticketData);
        }
        // If response.data is directly the ticket (ApiTicket)
        else if ("id" in apiData) {
          ticketData = apiData as ApiTicket;
          console.log("✅ Found direct ticket structure:", ticketData);
        }
      }

      if (ticketData) {
        setSelectedTicket(ticketData);
        console.log("✅ Ticket data set:", ticketData.id);
      } else {
        console.error("🔴 Could not find ticket data in response");
        console.error(
          "🔴 Response structure:",
          JSON.stringify(response.data, null, 2)
        );
      }
    } catch (error) {
      console.error("🔴 Failed to fetch ticket details:", error);
    } finally {
      setLoadingTicket(false);
    }
  };

  const closeDrawer = () => {
    setOpenAnnounce(false);
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
      case "hostTickets":
        return (
          <HostTickets
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
        return <Announcements refresh={refreshAnnouncements} />;
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

      {/* Loading overlay for ticket details */}
      {loadingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[3000000002] flex items-center justify-center">
          <div className="text-white text-lg">Loading ticket details...</div>
        </div>
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

      {/* ✅ UPDATED: Ticket Detail Drawer */}
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
              ticket={selectedTicket}
            />
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-[#121315CC] z-[9000] flex justify-end transition-opacity duration-300 ${
          openAnnounce ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpenAnnounce(false)}
      >
        <div
          className={`w-full lg:max-w-[608px]  md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
            openAnnounce ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <AddAnnouncementsDrawer
            isOpen={openAnnounce}
            onClose={closeDrawer}
            onSuccess={() => {
              setRefreshAnnouncements((prev) => !prev);
              closeDrawer();
            }}
          />
        </div>
      </div>
    </>
  );
}
