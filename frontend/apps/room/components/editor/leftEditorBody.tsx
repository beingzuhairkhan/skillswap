'use client'
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Code2, Terminal } from 'lucide-react';

// Judge0 language mapping
const languages = [
  { id: 63, label: "JavaScript", value: "javascript", icon: "JS" },
  { id: 71, label: "Python", value: "python", icon: "PY" },
  { id: 54, label: "C++", value: "cpp", icon: "C++" },
  { id: 62, label: "Java", value: "java", icon: "☕" },
];

const CodeEditorBody = () => {
  const [code, setCode] = useState("// Write your code here...\nconsole.log('Hello, World!');");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(languages[0]);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput(" Executing code...");
    if (!language) {
      throw new Error("Language not selected");
    }


    try {
      const response = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: language.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status?.id === 3) {
        setOutput(result.stdout || "✓ Code executed successfully (no output)");
      } else if (result.status?.id === 6) {
        setOutput(`Compilation Error:\n\n${result.compile_output || "Unknown error"}`);
      } else if (result.status?.id === 11 || result.status?.id === 12) {
        setOutput(` Runtime Error:\n\n${result.stderr || "Unknown error"}`);
      } else {
        setOutput(result.stdout || result.stderr || result.compile_output || "No output");
      }
    } catch (err) {
      setOutput(` Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col rounded-lg overflow-hidden shadow-2xl border border-slate-700">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Code Playground</h1>
            </div>

            <div className="flex items-center gap-2 ml-8">
              <span className="text-sm text-slate-400">Language:</span>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${language?.id === lang.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                    <span className="font-mono">{lang.icon}</span> {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-green-500/30 disabled:shadow-none"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Editor and Output Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor (Left - 65%) */}
        <div className="flex-[0.65] flex flex-col border-r border-slate-700">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Editor</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={language?.value}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 15,
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: "on",
                roundedSelection: true,
                padding: { top: 16, bottom: 16 },
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  useShadows: true,
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                renderLineHighlight: "all",
              }}
            />
          </div>
        </div>

        {/* Output Panel (Right - 35%) */}
        <div className="flex-[0.35] flex flex-col bg-slate-900">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Output</span>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-slate-950/30">
            <pre className="text-slate-100 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {output || (
                <span className="text-slate-500 italic">
                  Click "Run Code" to execute your program...
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorBody;