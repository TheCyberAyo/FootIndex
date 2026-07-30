"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { PlayerSearch } from "@/components/search/player-search";
import { Button } from "@/components/ui/button";
import { featuredComparePath } from "@/lib/brand/featured-rivalry";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import type { PlayerSearchResult } from "@/types/domain";

interface HomeHeroProps {
  trending?: PlayerSearchResult[];
}

export function HomeHero({ trending = [] }: HomeHeroProps) {
  return (
    <section className="relative isolate min-h-[92svh] overflow-hidden border-b border-white/10">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(108,171,221,0.22),_transparent_55%),linear-gradient(180deg,#0a0f14_0%,#000_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 bg-[url('/images/hero-haaland-vs-mbappe.png')] bg-cover bg-center"
      />

      <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.p
          className="mb-4 text-xs font-semibold tracking-[0.28em] text-brand uppercase"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {SITE_NAME}
        </motion.p>

        <motion.h1
          className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] sm:text-6xl md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {SITE_TAGLINE}
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-base text-white/75 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Career stats, comparisons, rankings, and trophies — dynamically generated
          for every player in our database.
        </motion.p>

        <motion.div
          className="mt-10 w-full max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <PlayerSearch variant="hero" trending={trending} />
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32 }}
        >
          <Button
            asChild
            size="lg"
            className="h-11 bg-brand px-6 text-brand-foreground hover:bg-brand/90"
          >
            <Link href="/search">Browse players</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 border-white/25 bg-black/30 px-6 text-white backdrop-blur-sm hover:bg-white/10"
          >
            <Link href="/rankings">Top rankings</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-11 px-6 text-white hover:bg-white/10"
          >
            <Link href={featuredComparePath()}>Featured compare</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
