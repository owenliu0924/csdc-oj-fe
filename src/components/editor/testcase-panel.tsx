"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, TerminalSquare, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type Testcase = {
  id: string;
  input: string;
  expected_output: string;
};

export type RunResult = {
  stdout: string;
  stderr: string;
  status: string; // e.g. "Accepted", "Wrong Answer", "Runtime Error"
  testcaseId: string;
};

type Props = {
  testcases: Testcase[];
  setTestcases: (tc: Testcase[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  runResult: RunResult | null;
  className?: string;
};

export function TestcasePanel({
  testcases,
  setTestcases,
  activeTab,
  setActiveTab,
  runResult,
  className,
}: Props) {
  const t = useTranslations("m");

  const runningTestcase = runResult ? testcases.find((tc) => tc.id === runResult.testcaseId) : null;
  const hasExpectedOutput = !!runningTestcase?.expected_output?.trim();
  const displayStatus = runResult && !hasExpectedOutput && (runResult.status === "Accepted" || runResult.status === "Wrong Answer")
    ? "Finished"
    : (runResult?.status || "");
  const isSuccess = displayStatus === "Accepted" || displayStatus === "Finished";
  const isFailed = displayStatus === "Wrong Answer";

  const handleAdd = () => {
    const id = `tc-${Date.now()}`;
    setTestcases([
      ...testcases,
      { id, input: "", expected_output: "" },
    ]);
    setActiveTab(id);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (testcases.length === 1) return;
    const nextList = testcases.filter((tc) => tc.id !== id);
    setTestcases(nextList);
    if (activeTab === id) {
      setActiveTab(nextList[0].id);
    }
  };

  const updateTestcase = (id: string, field: keyof Testcase, value: string) => {
    setTestcases(
      testcases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  return (
    <div className={`flex flex-col h-full bg-black/20 rounded-xl border border-white/10 ${className}`}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-white/10">
          <TabsList className="h-8 bg-transparent p-0 overflow-x-auto justify-start">
            {testcases.map((tc, index) => (
              <TabsTrigger
                key={tc.id}
                value={tc.id}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground rounded-lg px-3 py-1 text-xs gap-2"
              >
                Case {index + 1}
                {testcases.length > 1 && (
                  <span
                    onClick={(e) => handleRemove(tc.id, e)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </TabsTrigger>
            ))}
            {runResult && (
              <TabsTrigger
                value="result"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-muted-foreground rounded-lg px-3 py-1 text-xs gap-1 ml-2"
              >
                <TerminalSquare className="w-3.5 h-3.5" />
                Test Result
              </TabsTrigger>
            )}
          </TabsList>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {testcases.map((tc) => (
            <TabsContent key={tc.id} value={tc.id} className="m-0 h-full flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Input</label>
                <Textarea
                  value={tc.input}
                  onChange={(e) => updateTestcase(tc.id, "input", e.target.value)}
                  className="font-mono text-sm resize-none h-24 bg-black/40 border-white/5"
                  placeholder="Enter input here..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Expected Output (Optional)</label>
                <Textarea
                  value={tc.expected_output}
                  onChange={(e) => updateTestcase(tc.id, "expected_output", e.target.value)}
                  className="font-mono text-sm resize-none h-24 bg-black/40 border-white/5"
                  placeholder="Expected output for comparison..."
                />
              </div>
            </TabsContent>
          ))}

          {runResult && (
            <TabsContent value="result" className="m-0 h-full space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isFailed ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <TerminalSquare className="w-5 h-5 text-amber-500" />
                )}
                <span className={`font-bold ${
                  isSuccess ? "text-green-500" :
                  isFailed ? "text-red-500" : "text-amber-500"
                }`}>
                  {displayStatus}
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Console Output (stdout)</label>
                <pre className="font-mono text-sm bg-black/40 border border-white/5 rounded-md p-3 min-h-[60px] whitespace-pre-wrap">
                  {runResult.stdout || <span className="text-muted-foreground italic">No output</span>}
                </pre>
              </div>

              {runResult.stderr && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-red-400">Error Output (stderr)</label>
                  <pre className="font-mono text-sm bg-red-950/30 border border-red-500/20 text-red-300 rounded-md p-3 min-h-[60px] whitespace-pre-wrap">
                    {runResult.stderr}
                  </pre>
                </div>
              )}
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
