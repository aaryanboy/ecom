import { Suspense } from "react";
import SearchClient from "@/components/search/SearchClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="pt-24 text-center">Loading search…</div>}>
      <SearchClient />
    </Suspense>
  );
}
