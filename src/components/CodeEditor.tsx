import { Label } from "@/components/ui/label";
import CodeEditorComponent from "@uiw/react-textarea-code-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <div className="flex flex-col h-full">
      <Label htmlFor="code-input" className="text-sm font-medium mb-2">
        Code Input
      </Label>
      <div className="flex-1 overflow-auto border border-border rounded-md">
        <CodeEditorComponent
          value={value}
          language="javascript"
          placeholder="Paste your code here or upload files..."
          onChange={(e) => onChange(e.target.value)}
          padding={16}
          style={{
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            backgroundColor: 'hsl(var(--code-bg))',
            minHeight: '100%',
          }}
          className="font-mono"
        />
      </div>
    </div>
  );
};
