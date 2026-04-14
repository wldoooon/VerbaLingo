import Sidebar from "@/components/Sidebar";
import NavigationWrapper from "@/components/NavigationWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { MobileNavWrapper } from "@/components/MobileNavWrapper";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <NavigationWrapper />
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
        <FooterWrapper />
      </div>
      <MobileNavWrapper />
    </div>
  );
}
