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
      <div className="flex-1 min-h-0 border border-border rounded-md overflow-hidden">
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
            counterReset: 'line',
            height: '100%',
            overflow: 'auto',
          }}
          className="font-mono [&>textarea]:!outline-none [&>textarea]:resize-none [&>textarea]:!h-full [&_.token-line]:before:content-[counter(line)] [&_.token-line]:before:counter-increment-[line] [&_.token-line]:before:mr-4 [&_.token-line]:before:text-muted-foreground [&_.token-line]:before:inline-block [&_.token-line]:before:w-8 [&_.token-line]:before:text-right"
        />
      </div>
    </div>
  );
};
