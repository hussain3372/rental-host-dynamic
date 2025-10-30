"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supportApi } from "@/app/api/Admin/support";

interface Attachment {
  name: string;
  size: string;
  url: string;
}

interface Ticket {
  id: string;
  ticketId: string;
  issueType: string;
  subject: string;
  description: string;
  createdOn: string;
  status: string;
  attachment?: Attachment;
  data: string;
}

interface TicketDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onTicketUpdated?: () => void; // Add callback for when ticket is updated
}

export default function TicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onTicketUpdated,
}: TicketDetailDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  // ✅ Set status from table (ticket data)
  useEffect(() => {
    if (ticket?.status) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  // ✅ Handle status update
  const handleStatusUpdate = async () => {
    if (!ticket || !selectedStatus || selectedStatus === ticket.status) {
      return; // No changes or no ticket
    }

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const ticketId = ticket.ticketId || ticket.id;
      
      if (!ticketId) {
        throw new Error("Ticket ID not found");
      }

      console.log("🟡 Updating ticket status:", {
        ticketId,
        currentStatus: ticket.status,
        newStatus: selectedStatus,
        note
      });

      // Map UI status to API status
      const apiStatus = selectedStatus.toUpperCase();
      
      // Call the API to update ticket status
      const response = await supportApi.resolveTicket(ticketId, apiStatus);
      
      console.log("🟢 Ticket status updated successfully:", response);
      
      setUpdateMessage("Ticket status updated successfully!");
      
      // Notify parent component to refresh data
      if (onTicketUpdated) {
        onTicketUpdated();
      }

      // Close drawer after successful update (optional)
      // setTimeout(() => {
      //   onClose();
      // }, 2000);

    } catch (error) {
      console.error("🔴 Error updating ticket status:", error);
      setUpdateMessage("Error updating ticket status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Handle resolve ticket (if status is "Resolved")
  const handleResolveTicket = async () => {
    if (!ticket) return;

    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const ticketId = ticket.ticketId || ticket.id;
      
      if (!ticketId) {
        throw new Error("Ticket ID not found");
      }

      console.log("🟡 Resolving ticket:", ticketId);

      // Use the resolveTicket API method which includes resolution notes
      const response = await supportApi.resolveTicket(ticketId, note || "Ticket resolved");
      
      console.log("🟢 Ticket resolved successfully:", response);
      
      setUpdateMessage("Ticket resolved successfully!");
      
      // Notify parent component to refresh data
      if (onTicketUpdated) {
        onTicketUpdated();
      }

    } catch (error) {
      console.error("🔴 Error resolving ticket:", error);
      setUpdateMessage("Error resolving ticket. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Handle save based on selected status
  const handleSave = async () => {
    if (selectedStatus.toLowerCase() === "resolved") {
      await handleResolveTicket();
    } else {
      await handleStatusUpdate();
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {ticket.ticketId || ticket.id || "0001"}
        </h2>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 space-y-5 scrollbar-hide">
        <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
          Submitted on {ticket.createdOn} • Status:{" "}
          <span className="text-yellow-300 font-medium">{ticket.status}</span>
        </p>

        {/* Subject, Description, Attachment */}
        <div className="bg-[#121315] p-3 rounded-[8px] space-y-4">
          {/* Subject */}
          <div>
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-2">
              Subject
            </h3>
            <p className="text-[16px] leading-5 font-normal text-[#FFFFFF66]">
              {ticket.subject}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-5">
              Description
            </h3>
            <p className="text-[16px] leading-5 font-normal text-[#FFFFFF66] mb-1">
              {ticket.description || "No description available"}
            </p>
          </div>

          {/* Attachment - Only show if attachment exists */}
          {ticket.attachment && (
            <div className="flex items-center gap-5 bg-[#2D2D2D] p-3 rounded-lg">
              <Image
                src={ticket.attachment.url}
                alt={ticket.attachment.name}
                width={100}
                height={60}
                className="rounded object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = "/images/id.png";
                }}
              />
              <div>
                <h3 className="font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]">
                  {ticket.attachment.name}
                </h3>
                <h4 className="text-white/60 font-medium text-[14px] leading-[20px] pt-2">
                  {ticket.attachment.size}
                </h4>
              </div>
            </div>
          )}
        </div>

        {/* --- Status Field --- */}
        <div className="flex flex-col">
          <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-[10px]">
            Status
          </h3>
          <div className="flex gap-3">
            {["Resolved", "Pending"].map((status) => (
              <label
                key={status}
                className={`flex justify-between items-center flex-1 px-[12px] py-[12px] gap-[12px] rounded-[10px] cursor-pointer transition-all duration-200
                  ${
                    selectedStatus === status
                      ? "border border-[rgba(239,252,118,0.60)] rounded-[8px] bg-[rgba(239,252,118,0.08)]"
                      : "bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
                  }`}
              >
                {/* Text on left */}
                <span
                  className={`text-[14px] font-medium ${
                    selectedStatus === status
                      ? "text-[#E5F266]"
                      : "text-[#FFFFFF99]"
                  }`}
                >
                  {status}
                </span>

                {/* Checkbox on right */}
                <input
                  type="checkbox"
                  checked={selectedStatus === status}
                  onChange={() => setSelectedStatus(status)}
                  className="accent-[#E5F266] cursor-pointer w-4 h-4"
                  disabled={isUpdating}
                />
              </label>
            ))}
          </div>
        </div>

        {/* --- Note Field --- */}
        <div className="flex flex-col mt-5 mb-8">
          <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-[10px]">
            Note
          </h3>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note"
            className="w-full px-3 py-2 text-gray-300 focus:outline-none focus:border-[#E5F266] rounded-[10px]
              bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
            disabled={isUpdating}
          />
        </div>

        {/* Update Message */}
        {updateMessage && (
          <div className={`p-3 rounded-md ${
            updateMessage.includes("Error") 
              ? "bg-red-500/20 text-red-300" 
              : "bg-green-500/20 text-green-300"
          }`}>
            {updateMessage}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-7 flex-shrink-0 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-600 text-white px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50"
          disabled={isUpdating}
        >
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          disabled={isUpdating || selectedStatus === ticket.status}
          className="flex-1 yellow-btn cursor-pointer text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Updating..." : "Update Status"}
        </button>
      </div>
    </div>
  );
}