"use client";

import { use } from "react";
import { ProblemDetail } from "@/components/oj/problem-detail";

export default function ContestProblemPage({
  params,
}: {
  params: Promise<{ contestID: string; problemID: string }>;
}) {
  const { contestID, problemID } = use(params);
  return <ProblemDetail problemID={problemID} contestID={contestID} />;
}
