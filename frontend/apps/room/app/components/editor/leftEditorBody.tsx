'use client'
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

// Judge0 language mapping
const languages = [
  { id: 63, label: "JavaScript (Node.js)", value: "javascript" },
  { id: 71, label: "Python 3", value: "python" },
  { id: 54, label: "C++ (GCC 9.2.0)", value: "cpp" },
  { id: 62, label: "Java (OpenJDK 13)", value: "java" },
];

const CodeEditorBody = () => {
  const [code, setCode] = useState("// Start coding here...");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(languages[0]); // default JS

  const runCode = async () => {
    try {
      const response = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: code,
            language_id: language?.id,
          }),
        }
      );

      const result = await response.json();
      setOutput(result.stdout || result.stderr || result.compile_output || "No output");
    } catch (err) {
      setOutput("Error: " + err);
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 bg-black p-2">
        <label className="text-white text-sm">Language:</label>
        <select
          value={language?.id}
          onChange={(e) =>
            setLanguage(languages.find((lang) => lang.id === parseInt(e.target.value))!)
          }
          className="px-2 py-1 rounded bg-black text-white"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
        <button
          onClick={runCode}
          className="ml-auto bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
        >
          Run
        </button>
      </div>

      {/* Split: Left editor, Right output */}
      <div className="flex flex-1">
        {/* Code Editor (left) */}
        <div className="flex-1 bg-black rounded-lg">
          <Editor
            height="100%"
            width="100%"
            theme="vs-dark"
            language={language?.value}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Output (right, vertical box under run button) */}
        <div className="w-[29%] bg-black flex flex-col">
          <div className=" text-white p-2 text-sm">Output</div>
          <pre className="flex-1 text-green-400 p-2 overflow-y-auto">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorBody;
