"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { supportApi } from "@/app/api/super-admin/support";
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
  onTicketResolved?: () => void; // ✅ optional callback to refresh table
}

export default function TicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onTicketResolved,
}: TicketDetailDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ✅ Set status from ticket data
  useEffect(() => {
    if (ticket?.status) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  if (!isOpen) return null;

  const handleResolve = async () => {
    if (!ticket?.id) return;
    try {
      setLoading(true);
      await supportApi.resolveTicket(
        ticket.id,
        "Ticket resolved by Super Admin"
      );
      setSelectedStatus("RESOLVED");
      toast.success(" Ticket resolved successfully!");
      onTicketResolved?.();
      onClose();
    } catch (error) {
      console.error(" Failed to resolve ticket:", error);
      toast.error("Failed to resolve ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 py-3 shrink-0">
          <h2 className="text-lg font-semibold text-white">
            Loading Ticket...
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-lg">Loading ticket details...</div>
        </div>
      </div>
    );
  }

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

        <div className="bg-[#121315] p-4 rounded-lg space-y-4">
          {/* Subject */}
          <div>
            <h3 className="text-[14px] text-gray-300 font-medium mb-2">
              Subject
            </h3>
            <p className="text-[16px] text-white">{ticket.subject}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[14px] text-gray-300 font-medium mb-2">
              Description
            </h3>
            <p className="text-[16px] text-[#FFFFFFCC]">{ticket.description}</p>
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
      </div>

      {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
        <div className="p-5 shrink-0">
          <button
            onClick={handleResolve}
            disabled={loading}
            className={`yellow-btn cursor-pointer w-full text-black px-4 py-3 rounded-lg font-semibold text-[16px] transition-colors duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#E5F266]"
            }`}
          >
            {loading ? "Resolving..." : "Resolve Ticket"}
          </button>
        </div>
      )}
    </div>
  );
}
