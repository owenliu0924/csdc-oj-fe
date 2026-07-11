import { NextResponse } from "next/server";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "http://127.0.0.1:2358";

// Map OJ languages to Judge0 language IDs
const languageMap: Record<string, number> = {
  "C": 50,
  "C++": 54,
  "Java": 62,
  "Python3": 71,
  "Python2": 70,
  "Go": 60,
  "JavaScript": 63,
  "Rust": 73,
  "Ruby": 72,
  "Swift": 83,
  "Kotlin": 78,
  "PHP": 68,
  "C#": 51,
};

export async function POST(req: Request) {
  try {
    const { problem_id, language, code, input, expected_output } = await req.json();

    const language_id = languageMap[language] || 71; // Default to Python3 if unknown

    // Post to Judge0
    const judge0Res = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: language_id,
        stdin: input || "",
        expected_output: expected_output || "",
      }),
    });

    if (!judge0Res.ok) {
      const text = await judge0Res.text();
      return NextResponse.json({ data: text }, { status: judge0Res.status });
    }

    const result = await judge0Res.json();

    // Judge0 status handling
    // 1 In Queue
    // 2 Processing
    // 3 Accepted
    // 4 Wrong Answer
    // 5 Time Limit Exceeded
    // 6 Compilation Error
    // ...

    let stdout = result.stdout || "";
    let stderr = result.stderr || "";
    if (result.compile_output) {
      stderr += "\n[Compile Output]\n" + result.compile_output;
    }

    // Format output like the expected frontend `RunResult`
    return NextResponse.json({
      data: {
        stdout: stdout,
        stderr: stderr,
        status: result.status?.description || "Unknown",
        time: result.time,
        memory: result.memory
      }
    });
  } catch (err: any) {
    return NextResponse.json({ data: err.message }, { status: 500 });
  }
}
