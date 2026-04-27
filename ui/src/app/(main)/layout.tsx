import { AppShell } from "@/components/app-shell";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
