import React, { Suspense } from "react";

const Theme = React.lazy(() => import("../components/pages/theme"));

/* Lazy load - excludes them from SSR */

export default function ThemePage() {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Theme />
    </Suspense>
  );
}
