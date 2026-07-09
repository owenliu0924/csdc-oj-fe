"use client";

import { use } from "react";
import { ContestForm } from "@/components/admin/contest-form";

export default function EditContestPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = use(params);
  return <ContestForm contestId={contestId} />;
}
