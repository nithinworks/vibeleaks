import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      <Textarea
        id="code-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your code here or upload files..."
        className="flex-1 resize-none code-bg code-text border-terminal-border font-mono text-sm focus-visible:ring-primary"
      />
    </div>
  );
};
