import type { Metadata } from "next";
import type { ReactNode } from "react";

// Internal-only page — there's no login system yet, so keep it out of search
// engines at minimum (the URL itself isn't secret, but it shouldn't be
// crawlable/indexed while it has no real access control).
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
