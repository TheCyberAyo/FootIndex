import { AuthRoutePage } from "@/components/auth/auth-route-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign in",
  description:
    "Sign in to FootIndex with email magic link or Google — vote, comment, save favorites, and submit predictions.",
  path: "/login",
  noIndex: true,
});

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <AuthRoutePage mode="sign-in" searchParams={searchParams} />;
}
