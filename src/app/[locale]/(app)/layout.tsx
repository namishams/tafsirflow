import AppHeader from "@/components/AppHeader";
import TabBar from "@/components/TabBar";

// Shell for the learning app: app bar on top, tab bar at the bottom on phones
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="pb-[4.25rem] lg:pb-0">{children}</div>
      <TabBar />
    </>
  );
}
