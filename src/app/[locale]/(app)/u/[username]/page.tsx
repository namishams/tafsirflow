import { notFound, permanentRedirect } from "next/navigation";

// /u/<username> – short profile link (like the app's quranmasterclass://u/<username>); the profile is /talents/<username>
export default async function ShortProfile({ params }: { params: Promise<{ locale: string; username: string }> }) {
  const { locale, username } = await params;
  const u = decodeURIComponent(username).toLowerCase().replace(/^@/, "");
  if (!/^[a-z0-9_.]{3,20}$/.test(u)) notFound();
  permanentRedirect(`/${locale}/talents/${u}`);
}
