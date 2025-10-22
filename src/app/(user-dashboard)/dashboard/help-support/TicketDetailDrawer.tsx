"use client";

import React from "react";
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
    if (!isOpen || !ticket) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 flex-shrink-0">
                <h2 className="text-lg font-semibold">
                    {ticket.ticketId || ticket.id || "0001"}
                </h2>
            </div>

            {/* Body - Scrollable content (without the button) */}
            <div className="flex-1 overflow-y-auto px-7 space-y-10 scrollbar-hide">
                <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
                    Submitted on {ticket.createdOn} • Status:{" "}
                    <span className="text-yellow-300 font-medium">{ticket.status}</span>
                </p>

                <div className="bg-[#121315] p-3 rounded-[8px] space-y-4">
                    {/* Subject */}
                    <div className=" ">
                        <h3 className="text-[14] leading-[18px] text-gray-300 font-medium  mb-2">Subject</h3>
                        <p className="text-[16px] leading-5 font-normal text-[#FFFFFF66]">
                            {ticket.subject || "View management request - Need assistance with ticket view."}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[14] leading-[18px] text-gray-300 font-medium mb-5">
                            Description
                        </h3>
                        <p className="text-[16px] leading-5 font-normal text-[#FFFFFF66] mb-1">
                            {ticket.description ||
                                "This is a sample description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                        </p>
                    </div>

                    {/* Attachment (Static Card Fallback) */}
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
            </div>

            {/* Footer with Go Back button - Always fixed at bottom */}
            <div className="p-7 flex-shrink-0 ">
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