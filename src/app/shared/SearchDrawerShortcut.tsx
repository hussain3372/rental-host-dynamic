"use client";
import { useEffect } from "react";

export default function SearchDrawerShortcut({
  setIsSearchOpen,
}: {
  setIsSearchOpen: (value: boolean) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // stop browser’s default search
        setIsSearchOpen(true); // ✅ open your drawer
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  return null; // nothing to render
}
