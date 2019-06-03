import React, { Suspense } from "react";

const Admin = React.lazy(() => import("../components/pages/admin"));

/* Lazy load - excludes them from SSR */

export default function AdminPage() {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Admin />
    </Suspense>
  );
}
