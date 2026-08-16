"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function OnboardedGuard({
  onboarded,
  children,
}: {
  onboarded: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!onboarded && pathname !== "/app/assessment") {
      router.replace("/app/assessment");
    }
  }, [onboarded, pathname, router]);

  return <>{children}</>;
}
