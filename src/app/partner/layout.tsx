import { PartnerShell } from "@/layouts/partner-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PartnerShell>{children}</PartnerShell>;
}
