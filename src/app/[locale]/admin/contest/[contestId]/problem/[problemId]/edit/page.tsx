"use client";

import { use } from "react";
import { ProblemForm } from "@/components/admin/problem-form";

export default function EditContestProblemPage({
  params,
}: {
  params: Promise<{ contestId: string; problemId: string }>;
}) {
  const { contestId, problemId } = use(params);
  return <ProblemForm contestId={contestId} problemId={problemId} />;
}
