"use client";
import React, { useState } from "react";

type EditProfileDrawerProps = {
    initialName: string;
    initialEmail: string;
    onSave: (name: string, email: string) => void;
    onClose: () => void;
};

export default function EditProfileDrawer({
    initialName,
    initialEmail,
    onSave,
}: EditProfileDrawerProps) {
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);

    return (
        <div className="h-full flex flex-col justify-between text-white">
            {/* Top content */}
            <div className="space-y-5">
                <h2 className="text-[20px] leading-6 font-medium mb-3 ">Profile Information</h2>
                <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
                    View and update your personal details to keep your account information accurate.
                </p>
                <div>
                    <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`
                                        w-full p-3 pr-10 rounded-[10px]
                                        border border-[#404040]        
                                        hover:border-[#EFFC76]          
                                        focus:border-[#EFFC76]          
                                        bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
                                         placeholder:text-white/40
                                        focus:outline-none
                                        transition duration-200 ease-in-out
                                        text-white `} />
                </div>

                <div>
                    <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`
                                        w-full p-3 pr-10 rounded-[10px]
                                        border border-[#404040]        
                                        hover:border-[#EFFC76]          
                                        focus:border-[#EFFC76]          
                                        bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
                                         placeholder:text-white/40
                                        focus:outline-none
                                        transition duration-200 ease-in-out
                                        text-white `} />
                </div>
            </div>

            {/* Bottom button */}
            <div className="mt-6">
                <button
                    onClick={() => onSave(name, email)}
                                       className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"

                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
