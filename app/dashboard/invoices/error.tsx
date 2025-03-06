// an error boundary (Error component in this file) is a React component that catches JavaScript errors anywhere in its child component tree (in this case, dashboard/invoices/...), logs those errors, and displays a fallback UI instead of crashing the entire application.

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          // if you don't explicitly define the reset function, Next.js will provide a default implementation that re-renders the affected route segment or component as in this case.
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}
