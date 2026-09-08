"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PassportBuildFlag({ onBuilt }: { onBuilt: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("built") === "1") {
      onBuilt();
      // Strip the query param via the native History API, not router.replace():
      // the latter re-fetches the RSC payload for the new URL, an unnecessary
      // round trip since buildPhase is already tracked in client state.
      window.history.replaceState(null, "", pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
