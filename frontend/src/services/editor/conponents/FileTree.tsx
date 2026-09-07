"use client";

import { FileNode } from "@/types/file";
import FileNodeView from "./FileNode";
import { Fragment } from "react/jsx-runtime";

export default function FileTree({
  tree,
  onSelect,
  projectId,
  readOnly = false, 
}: {
  tree: FileNode[];
  onSelect: (file: FileNode) => void;
  projectId: string;
  sidebarWidth: number;
  readOnly?: boolean; 
}) {

  return (
    <div className="flex-1 overflow-y-auto scrollbar select-none">
      <div className="px-2 py-4">
        {tree &&
          tree.map((node) => (
            <Fragment key={node.id}>
              <FileNodeView
                node={node}
                onSelect={onSelect}
                projectId={projectId}
                readOnly={readOnly} 
              />
            </Fragment>
          ))}
      </div>

      {(!tree || tree.length === 0) && (
        <div className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
          {readOnly ? "No accessible files" : "Empty Project"}
        </div>
      )}
    </div>
  );
}
