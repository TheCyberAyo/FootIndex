"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  nextPath?: string;
}

/**
 * Lightweight auth modal — magic link + Google before voting.
 */
export function AuthDialog({
  open,
  onClose,
  nextPath = "/compare#vote",
}: AuthDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <GlassCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.18em] text-brand uppercase">
                Sign in
              </p>
              <h2
                id="auth-dialog-title"
                className="mt-1 font-display text-2xl font-bold text-foreground"
              >
                Vote as yourself
              </h2>
              <p className="mt-1 text-sm text-foreground/55">
                One vote per account. You can change it later.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={onClose}
              className="text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
          <LoginForm nextPath={nextPath} />
        </GlassCard>
      </div>
    </div>
  );
}
