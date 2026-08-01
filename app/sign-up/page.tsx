import { AuthRoutePage } from "@/components/auth/auth-route-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Create account",
  description:
    "Create a free FootIndex account with email magic link or Google — no password required.",
  path: "/sign-up",
  noIndex: true,
});

interface SignUpPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return <AuthRoutePage mode="sign-up" searchParams={searchParams} />;
}
