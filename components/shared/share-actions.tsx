"use client";

import { Link2, Share2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareActionsProps {
  url: string;
  title: string;
  text?: string;
  className?: string;
}

function buildShareLinks(url: string, title: string, text?: string) {
  const message = text ?? title;
  return {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`,
  };
}

export function ShareActions({ url, title, text, className }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks(url, title, text);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  const nativeShare = useCallback(async () => {
    if (!navigator.share) {
      return;
    }

    try {
      await navigator.share({ title, text: text ?? title, url });
    } catch {
      // User dismissed share sheet.
    }
  }, [text, title, url]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-white/20 bg-black/30 text-white hover:bg-white/10"
        onClick={() => void copyLink()}
      >
        <Link2 className="size-4" aria-hidden="true" />
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-white/20 bg-black/30 text-white hover:bg-white/10"
        asChild
      >
        <a href={links.x} target="_blank" rel="noopener noreferrer">
          Share on X
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-white/20 bg-black/30 text-white hover:bg-white/10"
        asChild
      >
        <a href={links.facebook} target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-white/20 bg-black/30 text-white hover:bg-white/10"
        asChild
      >
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </Button>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/20 bg-black/30 text-white hover:bg-white/10"
          onClick={() => void nativeShare()}
        >
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </Button>
      ) : null}
    </div>
  );
}
