"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TwoFAModal } from "./TwoFAModal";
import EmailVerifyDrawer from "./VerifyEmailDrawer";
import { AuthenticationEnable } from "./AuthenticationEnable";
import ChangePasswordDrawer from "./ChangePasswordDrawer";
import ToggleSwitch from "@/app/shared/Toggles";
import { Modal } from "@/app/shared/Modal";
import toast from "react-hot-toast";
import { setting } from "@/app/api/Host/setting";

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

// ✅ Define proper interface for notification payload
interface NotificationPayload {
  isEmailStatus: boolean;
  isNotificationStatus: boolean;
}

// ✅ Define proper error type
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

const NotificationPreferences: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);

  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const [, setIsLoading] = useState(false);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);
  const [isDisableAuthModalOpen, setIsDisableAuthModalOpen] = useState(false);

  // New states for Email and Push Notification modals
  const [isEmailEnableModalOpen, setIsEmailEnableModalOpen] = useState(false);
  const [isEmailDisableModalOpen, setIsEmailDisableModalOpen] = useState(false);
  const [isPushEnableModalOpen, setIsPushEnableModalOpen] = useState(false);
  const [isPushDisableModalOpen, setIsPushDisableModalOpen] = useState(false);

  const [email] = useState("johndeo@gmail.com");

  useEffect(() => {
    const mfaEnabled = localStorage.getItem("userMfaEnabled");

    if (mfaEnabled !== null) {
      setTwoFactorAuth(JSON.parse(mfaEnabled));
    }
  }, []);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const response = await setting.getSetting();

        console.log("main response", response);
        if (response.success) {
          const { isEmailStatus, isNotificationStatus } = response.data.data;

          console.log(response.data);

          setEmailNotifications(isEmailStatus ?? false);
          setPushNotifications(isNotificationStatus ?? false);
        }
      } catch (error: unknown) {
        console.error("Failed to fetch preferences:", error);

        let errorMessage = "Failed to fetch preferences";
        if (typeof error === "object" && error !== null) {
          const apiError = error as ApiError;
          errorMessage =
            apiError?.response?.data?.message ||
            apiError?.message ||
            errorMessage;
        }

        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle2FA = async () => {
    try {
      setIsLoading(true);

      const newMfaStatus = !twoFactorAuth;

      const payload = {
        mfaEnabled: newMfaStatus,
      };

      const response = await setting.changetwoFactorAuth(payload);

      if (response?.data?.mfaEnabled !== undefined) {
        setTwoFactorAuth(response.data.mfaEnabled);

        localStorage.setItem(
          "userMfaEnabled",
          JSON.stringify(response.data.mfaEnabled)
        );

        toast.success(
          response.data.mfaEnabled
            ? "Two-Factor Authentication enabled successfully"
            : "Two-Factor Authentication disabled successfully"
        );
      } else {
        toast.error("Failed to update Two-Factor Authentication status");
      }
    } catch (error: unknown) {
      console.error("2FA toggle error:", error);

      let errorMessage = "Something went wrong while updating 2FA";
      if (typeof error === "object" && error !== null) {
        const apiError = error as ApiError;
        errorMessage = apiError?.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Convert object to FormData for changeStatus API
  const objectToFormData = (obj: NotificationPayload): FormData => {
    const formData = new FormData();
    formData.append("isEmailStatus", obj.isEmailStatus.toString());
    formData.append(
      "isNotificationStatus",
      obj.isNotificationStatus.toString()
    );
    return formData;
  };

  // Update email notification status
  const updateEmailStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true);

      const payload: NotificationPayload = {
        isEmailStatus: newStatus,
        isNotificationStatus: pushNotifications,
      };

      // ✅ FIXED: Convert to FormData before sending
      const formData = objectToFormData(payload);
      const response = await setting.changeStatus(formData);

      if (response.success) {
        setEmailNotifications(newStatus);
        toast.success(
          newStatus
            ? "Email notifications enabled successfully"
            : "Email notifications disabled successfully"
        );
      }
    } catch (error: unknown) {
      console.error("Failed to update email status:", error);

      let errorMessage = "Failed to update email notifications";
      if (typeof error === "object" && error !== null) {
        const apiError = error as ApiError;
        errorMessage = apiError?.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
      setEmailNotifications(!newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  // Update push notification status
  const updatePushStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true);

      const payload: NotificationPayload = {
        isEmailStatus: emailNotifications,
        isNotificationStatus: newStatus,
      };

      // ✅ FIXED: Convert to FormData before sending
      const formData = objectToFormData(payload);
      const response = await setting.changeStatus(formData);

      if (response.success) {
        setPushNotifications(newStatus);
        toast.success(
          newStatus
            ? "Push notifications enabled successfully"
            : "Push notifications disabled successfully"
        );
      }
    } catch (error: unknown) {
      console.error("Failed to update push status:", error);

      let errorMessage = "Failed to update push notifications";
      if (typeof error === "object" && error !== null) {
        const apiError = error as ApiError;
        errorMessage = apiError?.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
      setPushNotifications(!newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (otp: string) => {
    console.log("Entered OTP:", otp);
    setIsDrawerOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <div className=" space-y-5 py-5">
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
            onToggleChange={() => {
              if (!emailNotifications) {
                setIsEmailEnableModalOpen(true);
              } else {
                setIsEmailDisableModalOpen(true);
              }
            }}
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
            onToggleChange={() => {
              if (!pushNotifications) {
                setIsPushEnableModalOpen(true);
              } else {
                setIsPushDisableModalOpen(true);
              }
            }}
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
        <div className="h-px bg-gray-700"></div>
        <div className="space-y-0">
          <PreferenceItem
            title="Change Password"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
            hasArrow
            onArrowClick={() => setIsPasswordDrawerOpen(true)}
          />

          <PreferenceItem
            title="2 - Factor Authentication"
            description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
            hasToggle
            toggleState={twoFactorAuth}
            onToggleChange={handleToggle2FA}
            trackWidth="w-[32px]"
            trackHeight="h-[19px]"
            thumbSize="w-4 h-4"
            iconSize="w-3 h-3"
            thumbTranslate="translate-x-2.5"
          />
        </div>
      </div>

      {/* Email Notification Enable Modal */}
      <Modal
        isOpen={isEmailEnableModalOpen}
        onClose={() => setIsEmailEnableModalOpen(false)}
        onConfirm={async () => {
          setIsEmailEnableModalOpen(false);
          await updateEmailStatus(true);
        }}
        title="Email Notifications Enabled"
        description="You will now receive email notifications for important updates and activities."
        image="/images/2fa-image.png"
        confirmText="Continue"
      />

      {/* Email Notification Disable Modal */}
      <Modal
        isOpen={isEmailDisableModalOpen}
        onClose={() => setIsEmailDisableModalOpen(false)}
        onConfirm={async () => {
          setIsEmailDisableModalOpen(false);
          await updateEmailStatus(false);
        }}
        title="Email Notifications Disabled"
        description="You will no longer receive email notifications. You can enable them again anytime."
        image="/images/2fa-image.png"
        confirmText="Continue"
      />

      {/* Push Notification Enable Modal */}
      <Modal
        isOpen={isPushEnableModalOpen}
        onClose={() => setIsPushEnableModalOpen(false)}
        onConfirm={async () => {
          setIsPushEnableModalOpen(false);
          await updatePushStatus(true);
        }}
        title="Push Notifications Enabled"
        description="You will now receive push notifications for important updates and activities."
        image="/images/2fa-image.png"
        confirmText="Continue"
      />

      {/* Push Notification Disable Modal */}
      <Modal
        isOpen={isPushDisableModalOpen}
        onClose={() => setIsPushDisableModalOpen(false)}
        onConfirm={async () => {
          setIsPushDisableModalOpen(false);
          await updatePushStatus(false);
        }}
        title="Push Notifications Disabled"
        description="You will no longer receive push notifications. You can enable them again anytime."
        image="/images/2fa-image.png"
        confirmText="Continue"
      />

      {/* 2FA Modal */}
      <TwoFAModal
        isOpen={is2FAModalOpen}
        onClose={() => {
          setIs2FAModalOpen(false);
        }}
        onConfirm={() => {
          setIs2FAModalOpen(false);
          setTwoFactorAuth(true);
          setIsDrawerOpen(true);
        }}
      />

      {/* Email Verify Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-[#121315CC] z-[2021] flex justify-end transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full  lg:max-w-[608px] md:max-w-[500px]  max-w-[280px] p-5 sm:p-7 h-full bg-[#0A0C0B] overflow-auto border border-[#FFFFFF1F] rounded-l-[12px] shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <EmailVerifyDrawer
              initialEmail={email}
              onClose={() => setIsDrawerOpen(false)}
              onVerify={handleVerifyOtp}
            />
          </div>
        </div>
      )}

      {/* Authentication Enable Modal */}
      <AuthenticationEnable
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={() => {
          console.log("2FA setup completed");
          setIsAuthModalOpen(false);
        }}
      />

      {/* Change Password Drawer */}
      {isPasswordDrawerOpen && (
        <div
          className="fixed inset-0 bg-[#121315CC] z-[2022] flex justify-end transition-opacity duration-300"
          onClick={() => setIsPasswordDrawerOpen(false)}
        >
          <div
            className="w-full lg:max-w-[608px] md:max-w-[550px] max-w-[280px] p-5 sm:p-7 h-full bg-[#0A0C0B] overflow-auto border border-[#FFFFFF1F] rounded-l-[12px] shadow-[0_4px_12px_0_rgba(0,0,0,0.12)] transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <ChangePasswordDrawer
              onSave={(current, newPass) => {
                console.log("Password updated:", current, newPass);
                // ⚠️ Do not close the drawer here — it will close automatically
                // after the success modal is confirmed in ChangePasswordDrawer
              }}
              onClose={() => setIsPasswordDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2FA Disable Modal */}
      {isDisableAuthModalOpen && (
        <Modal
          isOpen={isDisableAuthModalOpen}
          onClose={() => setIsDisableAuthModalOpen(false)}
          onConfirm={() => {
            setTwoFactorAuth(false);
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
