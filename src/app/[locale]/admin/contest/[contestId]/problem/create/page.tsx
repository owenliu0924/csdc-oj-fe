"use client";

import { use } from "react";
import { ProblemForm } from "@/components/admin/problem-form";

export default function CreateContestProblemPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = use(params);
  return <ProblemForm contestId={contestId} />;
}
