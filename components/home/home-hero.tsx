"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { PlayerSearch } from "@/components/search/player-search";
import { Button } from "@/components/ui/button";
import type { PlayerSearchResult } from "@/types/domain";

interface HomeHeroProps {
  trending?: PlayerSearchResult[];
}

/**
 * Full-bleed hero: rivalry portrait as the dominant visual plane.
 * Text sits in the center gap with a light scrim for readability —
 * no floating badges/cards in the first viewport.
 */
export function HomeHero({ trending = [] }: HomeHeroProps) {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden border-b border-white/10">
      <Image
        src="/images/hero-haaland-vs-mbappe.png"
        alt="Kylian Mbappé and Erling Haaland facing each other"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Readability scrim — keeps typography legible without covering the faces */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/85"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.15),_transparent_55%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.h1
          className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-7xl md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          HAALAND
        </motion.h1>

        <motion.p
          className="my-2 font-display text-2xl font-bold tracking-[0.35em] text-brand drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)] sm:my-3 sm:text-4xl"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          VS
        </motion.p>

        <motion.h1
          className="font-display text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-7xl md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          MBAPPÉ
        </motion.h1>

        <motion.p
          className="mt-6 max-w-md text-base text-white/80 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Career goals, club vs country, trophies — search any player or
          compare Haaland vs Mbappé season by season.
        </motion.p>

        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
        >
          <PlayerSearch variant="hero" trending={trending} />
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            className="h-11 bg-brand px-6 text-brand-foreground hover:bg-brand/90"
          >
            <Link href="/compare/haaland/mbappe">Compare Career Stats</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 border-white/25 bg-black/30 px-6 text-white backdrop-blur-sm hover:bg-white/10"
          >
            <Link href="/stats">Latest Stats</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-11 px-6 text-white hover:bg-white/10"
          >
            <Link href="/compare/haaland/mbappe#vote">Vote Now</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
