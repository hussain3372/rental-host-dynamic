"use client";

import React from "react";
import Image from "next/image";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ticket {
  id: string;
  userId: number; // ✅ Required
  subject: string;
  description: string;
  category: string; // ✅ Not issueType
  priority: string; // ✅ Missing
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
}

export default function TicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
}: TicketDetailDrawerProps) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 flex-shrink-0">
        <h2 className="text-lg font-semibold">{ticket.id || "0001"}</h2>
      </div>

      {/* Body - Scrollable content */}
      <div className="flex-1 overflow-y-auto px-7 space-y-10 scrollbar-hide">
        <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
          Submitted on {new Date(ticket.createdAt).toLocaleDateString()} •
          Status:{" "}
          <span className="text-yellow-300 font-medium">{ticket.status}</span>
        </p>

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
              {ticket.description}
            </p>
          </div>

          {/* Category & Priority
          <div className="flex justify-between text-[#FFFFFF99] text-[15px]">
            <p>
              <span className="text-gray-400">Category:</span>{" "}
              {ticket.category}
            </p>
            <p>
              <span className="text-gray-400">Priority:</span>{" "}
              {ticket.priority}
            </p>
          </div> */}

          {/* Submitted By */}
          {/* {ticket.user && (
            <div className="text-[#FFFFFF99] text-[15px]">
              <span className="text-gray-400">Submitted By:</span>{" "}
              {ticket.user.name} ({ticket.user.email})
            </div>
          )} */}

          {/* Attachment (Dynamic) */}
          {ticket.attachmentUrls?.length > 0 ? (
            <div className="flex items-center gap-5 bg-[#2D2D2D] p-3 rounded-lg">
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
            <div className="flex items-center gap-5 bg-[#2D2D2D] p-3 rounded-lg">
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

      {/* Footer with Go Back button */}
      <div className="p-7 flex-shrink-0">
        <button
          onClick={onClose}
          className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
