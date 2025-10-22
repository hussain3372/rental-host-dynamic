"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  X,
} from "lucide-react";

type ModalType =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "confirm"
  | "form";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

const iconMap: Record<ModalType, React.ReactNode> = {
  info: <Info className="text-blue-500 w-10 h-10" />,
  success: <CheckCircle2 className="text-green-500 w-10 h-10" />,
  warning: <AlertTriangle className="text-yellow-500 w-10 h-10" />,
  danger: <XCircle className="text-red-500 w-10 h-10" />,
  confirm: <HelpCircle className="text-purple-500 w-10 h-10" />,
  form: <Info className="text-gray-500 w-10 h-10" />,
};

export function Modal({
  isOpen,
  onClose,
  type = "info",
  title = "Modal Title",
  message,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}: ModalProps) {

  // Backdrop adapts to theme: lighter blur in light mode, darker in dark mode


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Close button */}
            <button
              className="absolute cursor-pointer right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              {iconMap[type]}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-center mb-2 dark:text-white">
              {title}
            </h2>

            {/* Message */}
            {message && (
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                {message}
              </p>
            )}

            {/* Custom Content */}
            {children && <div className="mt-4">{children}</div>}

            {/* Action Buttons (confirm + form types) */}
            {(type === "confirm" || type === "form") && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                  }}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {confirmText}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
