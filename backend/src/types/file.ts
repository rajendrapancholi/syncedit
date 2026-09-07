// Base types for DB records

export type User = {
  id: string; // UUID
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string; // ISO timestamp
};

export type Project = {
  id: string; // UUID
  name: string;
  description: string;
  ownerId: string; // references User.id
  createdAt: string;
  updatedAt: string;
};

export type Folder = {
  id: string; // UUID
  name: string;
  projectId: string; // references Project.id
  parent_id?: string | null; // references Folder.id
  createdAt: string;
  updatedAt: string;
};

export type ProjectFile = {
  id: string; // UUID
  name: string;
  folder_id?: string | null; // references Folder.id
  projectId: string; // references Project.id
  content: string;
  createdAt: string;
  updatedAt: string;
};

// Tree node type for frontend usage
export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parent_id?: string | null;
  content?: string | null; // only for files
  children?: FileNode[]; // only for folders
};

export type TreeNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parent_id?: string | null;
  content?: string | null; // only for files
  children?: FileNode[]; // only for folders
};
