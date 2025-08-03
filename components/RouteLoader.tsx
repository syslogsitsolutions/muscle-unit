"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageLoader, Spinner } from "./ui/loading";

export function RouteLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300); // simulate short load delay
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return <PageLoader />;
}
