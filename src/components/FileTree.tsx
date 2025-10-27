import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
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

const TreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isDirectory = node.type === "directory";

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-muted/60 rounded-lg cursor-pointer transition-all duration-200",
          level > 0 && "ml-4"
        )}
        onClick={() => isDirectory && setIsOpen(!isOpen)}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-primary" />
            )}
          </>
        ) : (
          <>
            <div className="w-4" />
            <File className="h-4 w-4 text-muted-foreground" />
          </>
        )}
        <span className="text-sm font-mono">{node.name}</span>
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
    <div className="flex flex-col h-full">
      <div className="text-sm font-semibold mb-3 px-3 text-foreground/90">Project Files</div>
      <div className="h-full overflow-auto rounded-lg p-3 bg-background/60">
        {tree.map((node) => (
          <TreeNode key={node.path} node={node} />
        ))}
      </div>
      <div className="mt-3 px-3 text-xs text-muted-foreground font-medium">
        {files.length} file(s) loaded
      </div>
    </div>
  );
};
