import { Button } from "@/components/ui/button";
import { Upload, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelected: (files: { name: string; content: string }[], isDirectory: boolean) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileSelect = async () => {
    try {
      // @ts-ignore - File System Access API
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Code files',
            accept: {
              'text/*': ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.env', '.json', '.yaml', '.yml'],
            },
          },
        ],
      });

      const files = await Promise.all(
        handles.map(async (handle) => {
          const file = await handle.getFile();
          const content = await file.text();
          return { name: file.name, content };
        })
      );

      onFilesSelected(files, false);
      
      toast({
        title: "Files loaded",
        description: `${files.length} file(s) selected for scanning`,
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Error loading files",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker();
      const files: { name: string; content: string }[] = [];

      const readDirectory = async (dirHandle: any, path = '') => {
        for await (const entry of dirHandle.values()) {
          const fullPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            // Skip files larger than 1MB
            if (file.size > 1024 * 1024) continue;
            
            const content = await file.text();
            files.push({ name: fullPath, content });
          } else if (entry.kind === 'directory') {
            await readDirectory(entry, fullPath);
          }
        }
      };

      await readDirectory(handle);
      onFilesSelected(files, true);

      toast({
        title: "Directory loaded",
        description: `${files.length} file(s) found in directory`,
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Error loading directory",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleFileSelect} variant="outline" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
      <Button onClick={handleDirectorySelect} variant="outline" size="sm">
        <FolderOpen className="h-4 w-4 mr-2" />
        Select Folder
      </Button>
    </div>
  );
};
