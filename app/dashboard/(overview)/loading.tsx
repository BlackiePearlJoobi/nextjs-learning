// This file is setting a fallback for the whole "page".
// Now that Suspense is implemented in page.tsx for each component, this file is no longer necessary.

import DashboardSkeleton from "@/app/ui/skeletons";

export default function Loading() {
  return <DashboardSkeleton />;
}
