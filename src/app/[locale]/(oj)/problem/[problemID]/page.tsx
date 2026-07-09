"use client";

import { use } from "react";
import { ProblemDetail } from "@/components/oj/problem-detail";

export default function ProblemPage({
  params,
}: {
  params: Promise<{ problemID: string }>;
}) {
  const { problemID } = use(params);
  return <ProblemDetail problemID={problemID} />;
}
