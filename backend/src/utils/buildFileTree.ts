import type { FileNode, Folder, ProjectFile, TreeNode } from "../types/file";

export function buildFileTree(files: FileNode[]): FileNode[] {
  const map = new Map<string, FileNode>();
  const roots: FileNode[] = [];

  files.forEach((file) => {
    map.set(file.id, { ...file, children: [] });
  });

  map.forEach((file) => {
    if (file.parent_id) {
      const parent = map.get(file.parent_id);
      if (parent) {
        parent.children!.push(file);
      } else {
        console.warn(`Parent not found for node ${file.id}`);
        roots.push(file); // fallback: treat as root
      }
    } else {
      roots.push(file);
    }
  });

  return roots;
}

/**
 * Build a file/folder tree directly from DB rows
 */
export function buildTree(
  folders: Folder[],
  files: ProjectFile[],
  projectId: string
): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const f of folders) {
    map.set(f.id, {
      id: f.id,
      name: f.name,
      type: "folder",
      parent_id: f.parent_id || null,
      children: [],
    });
  }

    //  Build Folder Hierarchy
  for (const folder of map.values()) {
    if (folder.parent_id) {
      const parent = map.get(folder.parent_id as string);
      if (parent) {
        parent.children!.push(folder);
      } else {
        roots.push(folder); 
      }
    } else {
      roots.push(folder); 
    }
  }

  for (const file of files) {
    const node: TreeNode = {
      id: file.id,
      name: file.name,
      type: "file",
      content: file.content,
      parent_id: file.folder_id ?? projectId,
    };

    if (file.folder_id) {
      const parent = map.get(file.folder_id);
      if (parent) parent.children!.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
