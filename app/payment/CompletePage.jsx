'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new payment success page
    router.push('/payment-success');
  }, [router]);

  return null; // No need to render anything as we're redirecting
}
