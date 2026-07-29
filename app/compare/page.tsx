import { redirect } from "next/navigation";

import { defaultComparePath } from "@/lib/compare";

interface ComparePageProps {
  searchParams: Promise<{
    season?: string;
    year?: string;
  }>;
}

/** Legacy /compare → canonical /compare/haaland/mbappe (preserves query params). */
export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.season) {
    query.set("season", params.season);
  }
  if (params.year) {
    query.set("year", params.year);
  }

  const suffix = query.toString();
  redirect(suffix ? `${defaultComparePath()}?${suffix}` : defaultComparePath());
}
