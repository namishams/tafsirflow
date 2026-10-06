import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";
import SiteFooter from "@/components/SiteFooter";

// Shell for the learning app: app bar on top, tab bar at the bottom on phones
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="pb-[4.25rem] lg:pb-0"><div className="page-in">{children}</div><SiteFooter /></div>
      <TabBar />
    </>
  );
}
