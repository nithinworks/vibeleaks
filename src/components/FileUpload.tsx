import { IconButton } from "@/components/IconButton";
import { FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelected: (files: { name: string; content: string }[], isDirectory: boolean) => void;
  size?: "default" | "lg";
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total project
const MAX_FILES = 2000; // Maximum number of files

export const FileUpload = ({ onFilesSelected, size = "default", className = "" }: FileUploadProps) => {
  const { toast } = useToast();

  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker();
      const files: { name: string; content: string }[] = [];
      let totalSize = 0;
      let skippedFiles = 0;
      let sizeLimitReached = false;

      const readDirectory = async (dirHandle: any, path = '') => {
        for await (const entry of dirHandle.values()) {
          const fullPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            
            // Check max files limit
            if (files.length >= MAX_FILES) {
              sizeLimitReached = true;
              return;
            }
            
            // Skip files larger than 5MB
            if (file.size > MAX_FILE_SIZE) {
              skippedFiles++;
              continue;
            }
            
            // Check total project size
            if (totalSize + file.size > MAX_TOTAL_SIZE) {
              sizeLimitReached = true;
              return;
            }
            
            const content = await file.text();
            files.push({ name: fullPath, content });
            totalSize += file.size;
          } else if (entry.kind === 'directory') {
            await readDirectory(entry, fullPath);
          }
        }
      };

      await readDirectory(handle);
      onFilesSelected(files, true);

      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      const warningMsg = sizeLimitReached 
        ? ` Warning: Reached size/file limits. Some files were skipped.`
        : skippedFiles > 0 
        ? ` (${skippedFiles} file(s) skipped due to size)`
        : '';

      toast({
        title: "Directory loaded",
        description: `${files.length} file(s) scanned (${totalSizeMB}MB total)${warningMsg}`,
        variant: sizeLimitReached ? "destructive" : "default",
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
    <IconButton 
      onClick={handleDirectorySelect}
      size={size} 
      className={className}
    >
      Select Project
    </IconButton>
  );
};
