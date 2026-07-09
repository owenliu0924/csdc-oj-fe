"use client";

import { use } from "react";
import { ProblemForm } from "@/components/admin/problem-form";

export default function EditProblemPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);
  return <ProblemForm problemId={problemId} />;
}
