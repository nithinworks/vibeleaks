import { Label } from "@/components/ui/label";
import CodeEditorComponent from "@uiw/react-textarea-code-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <div className="flex flex-col">
      <Label htmlFor="code-input" className="text-sm font-medium mb-2">
        Code Input
      </Label>
      <div className="h-[400px] border border-border rounded-md overflow-hidden relative">
        <CodeEditorComponent
          value={value}
          language="javascript"
          placeholder="Paste your code here or upload files..."
          onChange={(e) => onChange(e.target.value)}
          padding={16}
          data-color-mode="dark"
          style={{
            fontSize: 13,
            fontFamily: 'IBM Plex Mono, ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            backgroundColor: 'hsl(var(--code-bg))',
            height: '100%',
            overflow: 'auto',
          }}
          className="font-mono [&>textarea]:!outline-none [&>textarea]:!resize-none [&>textarea]:!overflow-auto [&>textarea]:!h-full [&>pre]:!overflow-visible"
        />
      </div>
    </div>
  );
};