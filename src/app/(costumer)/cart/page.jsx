import { Suspense } from "react";
import CartClient from "@/components/cart/CartClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="pt-24 text-center">Loading cart...</div>}>
      <CartClient />
    </Suspense>
  );
}
