"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supportApi } from "@/app/api/Admin/support";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: string;
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  attachmentUrls: string[];
  tags: string[];
  resolution: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface TicketDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onTicketResolved?: () => void;
}

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
    headers?: unknown;
  };
}

export default function TicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onTicketResolved,
}: TicketDetailDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🎯 TicketDetailDrawer - Props:", {
      isOpen,
      hasTicket: !!ticket,
      ticketId: ticket?.id,
    });
  }, [isOpen, ticket]);

  useEffect(() => {
    if (ticket?.status) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  useEffect(() => {
    if (ticket?.resolution) {
      setNote(ticket.resolution);
    }
  }, [ticket]);

  // ✅ Handle Update Status - calls appropriate API based on selected status
  const handleUpdateStatus = async () => {
    console.log("🟡 Update button clicked!");

    if (!ticket?.id) {
      console.error("🔴 No ticket ID found");
      toast.error("No ticket selected");
      return;
    }

    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setLoading(true);
      console.log("🟡 Starting update process for ticket:", ticket.id);
      console.log("🟡 Selected status:", selectedStatus);
      console.log("🟡 Resolution note:", note);

      let response;

      // Call different APIs based on selected status
      switch (selectedStatus) {
        case "PENDING":
          console.log("🟡 Calling pendingTicket API");
          response = await supportApi.pendingTicket(
            ticket.id,
            note || "Ticket marked as pending by admin"
          );
          toast.success("Ticket marked as pending successfully!");
          break;

        case "RESOLVED":
          console.log("🟡 Calling resolveTicket API");
          response = await supportApi.resolveTicket(
            ticket.id,
            note || "Ticket resolved by admin"
          );
          toast.success("Ticket marked as resolved successfully!");
          break;

        case "CLOSED":
          console.log("🟡 Calling closeTicket API");
          response = await supportApi.closeTicket(ticket.id);
          toast.success("Ticket closed successfully!");
          break;

        default:
          toast.error("Invalid status selected");
          return;
      }

      console.log("🟢 API Response received:", response);
      console.log("🟢 Response data:", response.data);

      // Call the callback to refresh table
      if (onTicketResolved) {
        console.log("🟡 Calling onTicketResolved callback");
        onTicketResolved();
      } else {
        console.log("🟡 No onTicketResolved callback provided");
      }

      onClose();
    } catch (error: unknown) {
      console.error("🔴 Failed to update ticket:", error);

      const apiError = error as ApiError;
      console.error("🔴 Error details:", {
        message: apiError?.message,
        response: apiError?.response?.data,
        status: apiError?.response?.status,
        headers: apiError?.response?.headers,
      });

      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Failed to update ticket. Please try again.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading ticket details...
      </div>
    );
  }

  // Determine button text based on selected status
  const getButtonText = () => {
    if (loading) return "Updating...";
    switch (selectedStatus) {
      case "PENDING":
        return "Mark as Pending";
      case "RESOLVED":
        return "Resolve Ticket";
      case "CLOSED":
        return "Close Ticket";
      default:
        return "Update Ticket";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 shrink-0">
        <h2 className="text-lg font-semibold text-white">
          TIK-{ticket.id || "0001"}
        </h2>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 space-y-6 scrollbar-hide py-4">
        <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
          Submitted on {new Date(ticket.createdAt).toLocaleDateString()} •
          Status:{" "}
          <span className="text-yellow-300 font-medium">{selectedStatus}</span>
        </p>

        <div className="bg-[#121315] p-4 rounded-lg space-y-4 border border-[#FFFFFF1F]">
          {/* Subject */}
          <div>
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-2">
              Subject
            </h3>
            <p className="text-[16px] leading-5 font-normal text-white">
              {ticket.subject}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-2">
              Description
            </h3>
            <p className="text-[16px] leading-5 font-normal text-[#FFFFFFCC]">
              {ticket.description}
            </p>
          </div>

          {/* Attachment */}
          {ticket.attachmentUrls?.length > 0 ? (
            <div className="flex items-center gap-5 bg-[#2D2D2D] p-3 rounded-lg border border-[#FFFFFF1F]">
              <Image
                src={ticket.attachmentUrls[0]}
                alt="Attachment"
                width={100}
                height={60}
                className="rounded object-cover"
              />
              <div>
                <h3 className="font-medium text-[16px] text-white">
                  Attachment
                </h3>
                <h4 className="text-white/60 text-[14px] break-all">
                  {ticket.attachmentUrls[0]}
                </h4>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 bg-[#2D2D2D] p-3 rounded-lg border border-[#FFFFFF1F]">
              <Image
                src="/images/id.png"
                alt="No Attachment"
                width={100}
                height={60}
                className="rounded object-cover"
              />
              <div>
                <h3 className="font-medium text-[16px] text-white">
                  No Attachment Found
                </h3>
                <h4 className="text-white/60 text-[14px]">N/A</h4>
              </div>
            </div>
          )}
        </div>

        {ticket.status === "OPEN" && (
          <div className="flex flex-col">
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-5">
              Update Status
            </h3>
            <div className="flex gap-3">
              {["PENDING", "RESOLVED"].map((status) => (
                <label
                  key={status}
                  className={`flex justify-between items-center flex-1 px-3 py-3 gap-3 rounded-lg cursor-pointer transition-all duration-200
            ${
              selectedStatus === status
                ? "border border-[#E5F266] bg-[rgba(229,242,102,0.08)]"
                : "bg-[#1A1A1A] border border-[#FFFFFF1F]"
            }`}
                >
                  <span
                    className={`text-[12px] font-medium ${
                      selectedStatus === status
                        ? "text-[#E5F266]"
                        : "text-[#FFFFFF99]"
                    }`}
                  >
                    {status}
                  </span>

                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    className="accent-[#E5F266] cursor-pointer w-3 h-3"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {ticket.status === "IN_PROGRESS" && (
          <div className="flex flex-col">
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-5">
              Update Status
            </h3>
            <div className="flex gap-3">
              {["CLOSED", "RESOLVED"].map((status) => (
                <label
                  key={status}
                  className={`flex justify-between items-center flex-1 px-3 py-3 gap-3 rounded-lg cursor-pointer transition-all duration-200
            ${
              selectedStatus === status
                ? "border border-[#E5F266] bg-[rgba(229,242,102,0.08)]"
                : "bg-[#1A1A1A] border border-[#FFFFFF1F]"
            }`}
                >
                  <span
                    className={`text-[12px] font-medium ${
                      selectedStatus === status
                        ? "text-[#E5F266]"
                        : "text-[#FFFFFF99]"
                    }`}
                  >
                    {status}
                  </span>

                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    className="accent-[#E5F266] cursor-pointer w-3 h-3"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Note Field */}
        <div
          className={`flex flex-col mt-5 mb-8 ${
            ticket.status === "RESOLVED" ? "pointer-events-none" : ""
          }`}
        >
          <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-2.5">
            Resolution Note
            {selectedStatus === "CLOSED" && (
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            )}
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              selectedStatus === "CLOSED"
                ? "Add closure details (optional)..."
                : "Add resolution details for this ticket..."
            }
            rows={3}
            className="w-full px-3 py-2 text-gray-300 focus:outline-none focus:border-[#E5F266] rounded-lg
              bg-[#1A1A1A] border border-[#FFFFFF1F] resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
        <div className="p-5 shrink-0">
          <button
            onClick={handleUpdateStatus}
            disabled={loading || selectedStatus === ticket.status}
            className={`yellow-btn cursor-pointer w-full text-black px-4 py-3 rounded-lg font-semibold text-[16px] transition-colors duration-300 ${
              loading || selectedStatus === ticket.status
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#E5F266]"
            }`}
          >
            {getButtonText()}
          </button>
        </div>
      )}
    </div>
  );
}
