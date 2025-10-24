import { Label } from "@/components/ui/label";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  const highlight = (code: string) => {
    return Prism.highlight(code, Prism.languages.javascript, "javascript");
  };

  return (
    <div className="flex flex-col">
      <Label htmlFor="code-input" className="text-sm font-medium mb-2">
        Code Input
      </Label>
      <div className="h-[500px] overflow-auto border border-border rounded-md bg-[#1e1e1e]">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          padding={16}
          placeholder="Paste your code here or upload files..."
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            fontSize: 13,
            minHeight: "500px",
            counterReset: "line",
          }}
          textareaClassName="focus:outline-none"
          className="editor-with-line-numbers"
        />
      </div>
    </div>
  );
};
