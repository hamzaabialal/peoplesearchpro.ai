import { AppShell } from "@/layouts/app-shell";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
