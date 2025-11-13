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

interface AdminTicketDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onTicketResolved?: () => void;
}

// Define proper error interface
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

export default function AdminTicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onTicketResolved,
}: AdminTicketDetailDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket?.status) setSelectedStatus(ticket.status);
  }, [ticket]);

  const handleResolve = async () => {
    if (!ticket?.id) {
      toast.error("No ticket selected");
      return;
    }

    try {
      setLoading(true);

      const response = await supportApi.resolveTicket(
        ticket.id,
        note || "Ticket resolved by admin"
      );

      setSelectedStatus("RESOLVED");
      toast.success("Ticket marked as resolved successfully!");

      if (onTicketResolved) onTicketResolved();

      onClose();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Failed to resolve ticket. Please try again.";
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
          Submitted by {ticket.user.name} on{" "}
          {new Date(ticket.createdAt).toLocaleDateString()} • Status:{" "}
          <span className="text-yellow-300 font-medium">{selectedStatus}</span>
        </p>

        <div className="bg-[#121315] p-4 rounded-lg space-y-4 border border-[#FFFFFF1F]">
          <div>
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-2">
              Subject
            </h3>
            <p className="text-[16px] leading-5 font-normal text-white">
              {ticket.subject}
            </p>
          </div>

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
      </div>
    </div>
  );
}
