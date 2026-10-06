import { redirect } from "@/i18n/navigation";

// "Blog" is the guides section; keep one URL for search engines
export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/guides", locale });
}
