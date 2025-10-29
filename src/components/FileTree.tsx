import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, FileCode, FileJson, FileType, FileText, Lock, Braces, Palette, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileTreeProps {
  files: { name: string; content: string }[];
}

type TreeMap = Map<string, { node: Omit<FileNode, 'children'>; children: TreeMap }>;

const buildTree = (files: { name: string; content: string }[]): FileNode[] => {
  const root: TreeMap = new Map();

  files.forEach((file) => {
    const parts = file.name.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (!current.has(part)) {
        current.set(part, {
          node: {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            type: index === parts.length - 1 ? "file" : "directory",
          },
          children: new Map(),
        });
      }
      const item = current.get(part)!;
      current = item.children;
    });
  });

  const convertToArray = (map: TreeMap): FileNode[] => {
    return Array.from(map.values()).map(({ node, children }) => ({
      ...node,
      children: children.size > 0 ? convertToArray(children) : undefined,
    }));
  };

  return convertToArray(root);
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return { icon: FileCode, color: 'text-yellow-500' };
    case 'json':
      return { icon: FileJson, color: 'text-amber-500' };
    case 'py':
      return { icon: FileCode, color: 'text-blue-500' };
    case 'env':
      return { icon: Lock, color: 'text-green-500' };
    case 'md':
    case 'mdx':
      return { icon: FileText, color: 'text-purple-500' };
    case 'css':
    case 'scss':
    case 'sass':
      return { icon: Palette, color: 'text-pink-500' };
    case 'html':
      return { icon: Globe, color: 'text-orange-500' };
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return { icon: FileType, color: 'text-indigo-500' };
    case 'yml':
    case 'yaml':
      return { icon: Braces, color: 'text-red-500' };
    default:
      return { icon: File, color: 'text-muted-foreground' };
  }
};

const TreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isDirectory = node.type === "directory";
  const fileIconData = !isDirectory ? getFileIcon(node.name) : null;
  const FileIcon = fileIconData?.icon || File;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-muted/60 rounded-lg cursor-pointer transition-all duration-200",
          level > 0 && "ml-3 sm:ml-4"
        )}
        onClick={() => isDirectory && setIsOpen(!isOpen)}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <div className="w-3.5 sm:w-4 flex-shrink-0" />
            <FileIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0", fileIconData?.color)} />
          </>
        )}
        <span className="text-xs sm:text-sm font-mono break-all">{node.name}</span>
      </div>
      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree = ({ files }: FileTreeProps) => {
  const tree = buildTree(files);

  return (
    <div className="p-3 sm:p-4 space-y-2">
      <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b border-border/50">
        <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-hover" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground/80">Project Files</span>
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        {tree.map((node) => (
          <TreeNode key={node.path} node={node} />
        ))}
      </div>
      <div className="mt-2 sm:mt-3 pt-2 border-t border-border/50 text-center">
        <span className="text-[10px] sm:text-xs text-muted-foreground">{files.length} file(s) loaded</span>
      </div>
    </div>
  );
};
