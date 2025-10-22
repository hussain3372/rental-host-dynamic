"use client";
import React, { useState } from "react";
import Image from "next/image";
import { TwoFAModal } from "./TwoFAModal";
import TimeOutDrawer from "./TimeOut";
import { AuthenticationEnable } from "./AuthenticationEnable";
import ChangePasswordDrawer from "./ChangePasswordDrawer";
import ToggleSwitch from "@/app/shared/Toggles";
import { Modal } from "@/app/shared/Modal";

interface PreferenceItemProps {
  title: string;
  description: string;
  hasToggle?: boolean;
  hasArrow?: boolean;
  onArrowClick?: () => void;
  toggleState?: boolean;
  onToggleChange?: () => void;
  trackWidth?: string;
  trackHeight?: string;
  thumbSize?: string;
  iconSize?: string;
  thumbTranslate?: string;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({
  title,
  description,
  hasToggle = false,
  hasArrow = false,
  toggleState,
  onToggleChange,
  trackWidth,
  trackHeight,
  thumbSize,
  iconSize,
  thumbTranslate,
  onArrowClick,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    {/* Title + description */}
    <div className="flex-1 relative w-full">
      <div className="flex justify-between items-center sm:block">
        <h4 className="text-white text-[16px] leading-[20px] font-medium mb-2 pt-3">
          {title}
        </h4>

        <div className="sm:hidden flex items-center gap-2">
          {hasToggle && toggleState !== undefined && onToggleChange && (
            <ToggleSwitch
              isOn={toggleState}
              onToggle={onToggleChange}
              trackWidth={trackWidth}
              trackHeight={trackHeight}
              thumbSize={thumbSize}
              iconSize={iconSize}
              thumbTranslate={thumbTranslate}
            />
          )}
          {hasArrow && (
            <Image
              src="/images/arrow-right.png"
              alt="arrow right"
              width={20}
              height={20}
              className="text-[#FFFFFF99]"
              onClick={onArrowClick}
            />
          )}
        </div>
      </div>

      <p className="text-[#FFFFFF99] text-[16px] leading-5 font-normal pb-5">
        {description}
      </p>
    </div>
    <div className="hidden sm:flex ml-4 flex-shrink-0">
      {hasToggle && toggleState !== undefined && onToggleChange && (
        <ToggleSwitch
          isOn={toggleState}
          onToggle={onToggleChange}
          trackWidth={trackWidth}
          trackHeight={trackHeight}
          thumbSize={thumbSize}
          iconSize={iconSize}
          thumbTranslate={thumbTranslate}
        />
      )}
      {hasArrow && (
        <Image
          src="/images/arrow-right.png"
          alt="arrow right"
          width={20}
          height={20}
          className="text-[#FFFFFF99] cursor-pointer"
          onClick={onArrowClick}
        />
      )}
    </div>
  </div>
);

const NotificationPreferences: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);
    const [isDisableAuthModalOpen, setIsDisableAuthModalOpen] = useState(false);

  // const [isOn, setIsOn] = useState(false);


  const handleSaveChange = () => {
    console.log("Changes saved");
    setIsDrawerOpen(false)
  };

  // const handleContinueFromModal = () => {
  //   setIs2FAModalOpen(false);
  //   setIsDrawerOpen(true);
  // };

  return (
    <div className=" space-y-5 py-5">

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[20px] leading-[24px] font-semibold text-white">
          Settings & Preferences
        </h1>
      </div>
      <p className="text-4 leading-5 text-[#FFFFFF99] font-normal mb-[40px] max-w-[573px] w-full">
       Manage your personal details, security, notifications, and billing all in one place. Customize your experience and keep your account up to date.
      </p>
      
      {/* Notification Preferences Card */}
      <div className="bg-[#121315] rounded-[12px] p-5">
        <h3 className="text-white text-[18px] leading-[22px] font-medium mb-5">
          Notification Preferences
        </h3>
        <div className="h-px bg-gray-700 mb-3"></div>

        <div className="space-y-0">
          <PreferenceItem
            title="Email Notifications"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
            hasToggle
            toggleState={emailNotifications}
            onToggleChange={() => setEmailNotifications(!emailNotifications)}
            trackWidth="w-[32px]"
            trackHeight="h-[19px]"
            thumbSize="w-4 h-4"
            iconSize="w-3 h-3"
            thumbTranslate="translate-x-2.5"
          />

          <PreferenceItem
            title="Push Notifications"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
            hasToggle
            toggleState={pushNotifications}
            onToggleChange={() => setPushNotifications(!pushNotifications)}
            trackWidth="w-[32px]"
            trackHeight="h-[19px]"
            thumbSize="w-4 h-4"
            iconSize="w-3 h-4"
            thumbTranslate="translate-x-2.5"
          />
        </div>
      </div>

      {/* Security Preferences Card */}
      <div className="bg-[#121315] rounded-[12px] p-5">
        <h3 className="text-white text-[18px] leading-[22px] font-medium mb-5">
          Security Preferences
        </h3>
        <div className="h-px bg-gray-700"></div>{" "}
        {/* ✅ keep only heading bottom line */}
        <div className="space-y-0">
          <PreferenceItem
            title="Change Password"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
            hasArrow
            onArrowClick={() => setIsPasswordDrawerOpen(true)}
          />
          <PreferenceItem
            title="Session Timeout"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,"
            hasArrow
            onArrowClick={() => setIsDrawerOpen(true)}
          />

        </div>
      </div>
      <TwoFAModal
        isOpen={is2FAModalOpen}
        onClose={() => {
          setIs2FAModalOpen(false);
        }}
        onConfirm={() => {
          setIsDrawerOpen(true);
        }}
      />


      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-[#121315CC] z-[2021] flex justify-end transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        >
          {/* Drawer Panel */}
          <div
            className="w-full  lg:max-w-[608px] md:max-w-[500px]  max-w-[280px] p-5 sm:p-7 h-full bg-[#0A0C0B] overflow-auto border border-[#FFFFFF1F] rounded-l-[12px] shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <TimeOutDrawer
              onClose={() => setIsDrawerOpen(false)}
              onVerify={handleSaveChange}
            />
          </div>
        </div>
      )}
      {/* step 3 */}
      <AuthenticationEnable
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={() => {
          console.log("2FA setup completed");
          setIsAuthModalOpen(false); // ✅ only close modal now
        }}
      />
      {/* Step 4 - Change Password Drawer */}
      {isPasswordDrawerOpen && (
        <div
          className="fixed inset-0 bg-[#121315CC] z-[2022] flex justify-end transition-opacity duration-300"
          onClick={() => setIsPasswordDrawerOpen(false)}
        >
          <div
            className="w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 h-full bg-[#0A0C0B] overflow-auto border border-[#FFFFFF1F] rounded-l-[12px] shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <ChangePasswordDrawer
              onSave={(current, newPass) => {
                console.log("Password updated:", current, newPass);
                setIsPasswordDrawerOpen(false);
              }}
              onClose={() => setIsPasswordDrawerOpen(false)}
            />
          </div>
        </div>
      )}
{isDisableAuthModalOpen && (
  <Modal
    isOpen={isDisableAuthModalOpen}
    onClose={() => setIsDisableAuthModalOpen(false)}
    onConfirm={() => {
      setIsDisableAuthModalOpen(false);
    }}
    title="Two-Factor Authentication Disabled"
    description="Your two-factor authentication has been successfully disabled."
          image="/images/2fa-image.png"
    confirmText="Okay"
  />
)}

    </div>
  );
};

export default NotificationPreferences;
