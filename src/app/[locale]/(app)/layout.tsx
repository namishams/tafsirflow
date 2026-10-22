import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import SiteFooter from "@/components/SiteFooter";
import UsernameGuard from "@/components/talents/UsernameGuard";
import { Suspense } from "react";
import TutorBubble from "@/components/tutor/TutorBubble";

// Shell for the learning app: app bar on top, tab bar at the bottom on phones
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="pb-[4.25rem] lg:pb-0"><div className="page-in"><UsernameGuard />{children}</div><SiteFooter /></div>
      <TabBar />
      <Suspense fallback={null}><TutorBubble /></Suspense>
    </>
  );
}
