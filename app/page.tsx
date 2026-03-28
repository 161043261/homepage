"use client";

import { BookOpenText, Copy, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";

const DEFAULT_CODES: Record<string, string> = {
  javascript: `// JavaScript Example
/**
 * Calculate the greatest common divisor (GCD) of two numbers
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @returns The GCD of a and b.
 */
function gcdIterative(a, b) {
  if (a < b) {
    const temp = a;
    a = b;
    b = temp;
  }
  while (b !== 0) {
    const temp = a % b;
    a = b;
    b = temp;
  }
  return a;
}`,
  typescript: `// TypeScript Example
function gcdRecursive(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return gcdRecursive(b, a % b);
}`,
};

export default function Home() {
  const [language, setLanguage] = useState<"javascript" | "typescript">(
    "javascript",
  );
  const [code, setCode] = useState(DEFAULT_CODES.javascript);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"vs-light" | "vs-dark">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "vs-dark"
        : "vs-light";
    }
    return "vs-light";
  });
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "vs-dark" : "vs-light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleLanguageChange = (lang: "javascript" | "typescript") => {
    setLanguage(lang);
    setCode(DEFAULT_CODES[lang]);
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current?.getAction("editor.action.formatDocument")?.run();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-base-100 flex min-h-screen flex-col font-sans">
      <main className="relative flex w-full grow flex-col">
        {/* Code Editor Section */}
        <div className="bg-base-300 border-base-content/5 flex min-h-screen w-full flex-col shadow-inner">
          <div className="bg-base-200 border-base-content/10 z-10 flex items-center justify-between border-b px-4 py-3 shadow-sm">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) =>
                  handleLanguageChange(
                    e.target.value as "javascript" | "typescript",
                  )
                }
                className="select select-bordered select-sm bg-base-100 w-32"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Link
                href="/docs"
                className="btn btn-sm btn-primary btn-outline"
                title="Go to Docs"
              >
                <BookOpenText className="mr-1 h-4 w-4" /> Docs
              </Link>
              <button
                onClick={handleFormat}
                className="btn btn-sm btn-ghost text-base-content/70 hover:text-base-content"
                title="Format Code"
              >
                Format
              </button>
              <button
                onClick={handleCopy}
                className={`btn btn-sm ${copied ? "btn-success text-success-content" : "btn-ghost text-base-content/70 hover:text-base-content"}`}
              >
                <Copy className="mr-1 h-4 w-4" /> {copied ? "Copied!" : "Copy"}
              </button>
              <div className="border-base-content/10 ml-1 flex items-center gap-2 border-l pl-2">
                <Sun
                  className={`h-4 w-4 ${theme === "vs-light" ? "text-primary" : "text-base-content/50"}`}
                />
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  checked={theme === "vs-dark"}
                  onChange={(e) =>
                    setTheme(e.target.checked ? "vs-dark" : "vs-light")
                  }
                  title="Toggle Theme"
                />
                <Moon
                  className={`h-4 w-4 ${theme === "vs-dark" ? "text-primary" : "text-base-content/50"}`}
                />
              </div>
            </div>
          </div>

          <div className="relative h-[calc(100vh-60px)] grow">
            <Editor
              height="100%"
              language={language}
              theme={theme}
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono), monospace",
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                formatOnPaste: true,
                // Virtualization and rendering optimizations
                automaticLayout: true,
                wordWrap: "on",
                fixedOverflowWidgets: true,
              }}
              className="absolute inset-0"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
