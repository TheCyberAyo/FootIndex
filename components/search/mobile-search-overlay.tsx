"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { PlayerSearch } from "@/components/search/player-search";
import { Button } from "@/components/ui/button";

interface MobileSearchOverlayProps {
  onClose: () => void;
}

/**
 * Full-screen search for viewports below lg (header search is desktop-only).
 */
export function MobileSearchOverlay({ onClose }: MobileSearchOverlayProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-xl md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Search players"
    >
      <div className="flex items-start gap-2 border-b border-border px-4 py-3">
        <PlayerSearch
          variant="overlay"
          autoFocus
          className="min-w-0 flex-1"
          onClose={onClose}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          aria-label="Close search"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
