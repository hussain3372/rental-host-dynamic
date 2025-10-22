    "use client";
    import React from "react";
    import Image from "next/image";

    type HelpSupportDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    };

    export default function PlatformDrawer({ onClose }: HelpSupportDrawerProps) {

    return (
        <div className="h-full flex flex-col justify-between text-white">
        {/* Top content */}
        <div className="space-y-5 flex-1">
            <h2 className="text-[20px] leading-6 font-medium mb-3">
            Platform Updates
            </h2>
            <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
            Aug 12, 2025
            </p>

            <div className="relative bg-[#121315] p-3 rounded-lg">
            <label className="text-white text-sm font-medium mb-3 block">
                Title
            </label>
            <p className="text-[16px] font-regular leading-5 text-[#FFFFFF66]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <label className="text-white text-sm font-medium mb-3 mt-5 block">
                Subject
            </label>
            <p className="text-[16px] font-regular leading-5 text-[#FFFFFF66]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <h2 className="font-medium text-[14px] leading-[18px] text-[#FFFFFF] mt-5 mb-[10px]">Uploaded Image</h2>
            <Image src="/images/demo.png" alt="demo" height={220} width={528} />
        </div>
            </div>

        {/* Report Issue Button with responsive margin */}
        <div className="">
            <button
            onClick={onClose}
            className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
            >
            Close Ticket
            </button>
        </div>
        </div>
    );
    }
