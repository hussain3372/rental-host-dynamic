"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

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
  description?: string;
  createdOn: string;
  status: string;
  attachment?: Attachment;
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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [note, setNote] = useState("");

  // ✅ Set status from table (ticket data)
  useEffect(() => {
    if (ticket?.status) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

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
              {ticket.subject ||
                "View management request - Need assistance with ticket view."}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[14px] leading-[18px] text-gray-300 font-medium mb-5">
              Description
            </h3>
            <p className="text-[16px] leading-5 font-normal text-[#FFFFFF66] mb-1">
              {ticket.description ||
                "This is a sample description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </p>
          </div>

          {/* Attachment */}
          <div className="flex items-center gap-5 bg-[#2D2D2D] p-3 rounded-lg">
            <Image
              src={ticket.attachment?.url || "/images/id.png"}
              alt={ticket.attachment?.name || "ID"}
              width={100}
              height={60}
              className="rounded object-cover"
            />
            <div>
              <h3 className="font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]">
                {ticket.attachment?.name || "Government-issued ID"}
              </h3>
              <h4 className="text-white/60 font-medium text-[14px] leading-[20px] pt-2">
                {ticket.attachment?.size || "12.3kb"}
              </h4>
            </div>
          </div>
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
          />
        </div>
      </div>

      {/* Footer */}
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
