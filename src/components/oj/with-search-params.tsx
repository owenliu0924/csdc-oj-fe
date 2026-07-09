"use client";

import { Suspense } from "react";
import { Loading } from "@/components/oj/loading";

export function WithSearchParams({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;

}
