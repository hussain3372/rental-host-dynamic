"use client";
import React, { useState, useEffect } from "react";
import Tabs from "./Tabs";
import HostTicketTable from "./HostTicketTable";
import MyTicketsTable from "./MyTicketsTable";
import HelpSupportDrawer from "./HelpSupportDrawer";
import TicketDetailDrawer from "./TicketDetailDrawer";
import { Modal } from "@/app/shared/Modal";
import { supportApi } from "@/app/api/Admin/support";
import { Ticket as ApiTicket } from "@/app/api/Admin/support/types";

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
  const [activeTab, setActiveTab] = useState("host");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal and drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    console.log("🔍 Detail Drawer State:", {
      isDetailDrawerOpen,
      selectedTicket: selectedTicket ? "Has ticket" : "No ticket",
      loadingDetails,
    });
  }, [isDetailDrawerOpen, selectedTicket, loadingDetails]);
  const handleViewDetails = async (ticket: CertificationData) => {
    console.log(
      " START: handleViewDetails called for ticket:",
      ticket["Ticket Id"]
    );
    setLoadingDetails(true);
    setIsDetailDrawerOpen(true);

    try {
      const response = await supportApi.getTicketById(ticket["Ticket Id"]);
      console.log("🔵 Full API Response:", response);

      if (response.data) {
        const ticketData = response.data;
        setSelectedTicket(ticketData);
        console.log(" Ticket loaded:", ticketData.id);
      } else {
        console.error(" No detailed ticket data found in response");
      }
    } catch (error) {
      console.error(" Error fetching ticket details:", error);
    } finally {
      setLoadingDetails(false);
      console.log(" Loading completed");
    }
  };

  const handleTicketCreated = () => {
    console.log(" Ticket created, refreshing list...");
    setRefreshTrigger((prev) => prev + 1);
    setCurrentPage(1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "host":
        return (
          <HostTicketTable
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
      case "my":
        return (
          <MyTicketsTable
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            isFilterOpen={isFilterOpen}
            onFilterToggle={setIsFilterOpen}
            onViewDetails={handleViewDetails}
            refreshTrigger={refreshTrigger}
          />
        );
      default:
        return null;
    }
  };

  const showCreateTicketButton = activeTab === "my";

  const handleDetailDrawerClose = () => {
    console.log(" Detail drawer close triggered");
    setIsDetailDrawerOpen(false);
    setTimeout(() => setSelectedTicket(null), 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log(" Backdrop clicked");
    if (e.target === e.currentTarget) {
      handleDetailDrawerClose();
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

      {loadingDetails && (
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

        {showCreateTicketButton && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="yellow-btn cursor-pointer text-black px-[20px] py-[12px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
          >
            Create Ticket
          </button>
        )}
      </div>

      <div className="mb-6">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {renderTabContent()}

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
            onTicketCreated={handleTicketCreated}
          />
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-[#121315CC] z-[3000000001] flex justify-end transition-opacity duration-300 ${
          isDetailDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
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
              onClose={handleDetailDrawerClose}
              ticket={selectedTicket}
            />
          </div>
        </div>
      </div>
    </>
  );
}
