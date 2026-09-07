import pool from "../config/db";
import type { FileNode, Folder, ProjectFile } from "../types/file";
import { buildTree } from "../utils/buildFileTree";

/**
 * Fetches all folders and files for a project and builds a nested tree structure.
 */

export const getProjectTree = async (
  projectId: string
): Promise<FileNode[]> => {
  const folders = await pool.query<Folder>(
    "SELECT * FROM folders WHERE project_id = $1",
    [projectId]
  );

  const mappedFolders = folders.rows.map((f) => ({
    ...f,
    parentId: f.parent_id,  
    type: "folder",
    children: [] 
  }));

  const files = await pool.query<ProjectFile>(
    "SELECT * FROM files WHERE project_id = $1",
    [projectId]
  );

  const mappedFiles = files.rows.map((f) => ({
    ...f,
    parentId: f.folder_id,
    type: "file"
  }));

  return buildTree(mappedFolders, mappedFiles, projectId);
};

/**
 * Creates a new file or folder in the database.
 */
export const createFile = async (
  projectId: string,
  name: string,
  type: "file" | "folder",
  parentId?: string,
) => {
  console.log("serveriof the create file")
  if (type === "folder") {
    const result = await pool.query(
      "INSERT INTO folders (name, project_id, parent_id) VALUES ($1, $2, $3) RETURNING *",
      [name, projectId, parentId || null],
    );
    return { ...result.rows[0], type: "folder", children: [] };
  } else {
    const result = await pool.query(
      "INSERT INTO files (name, project_id, folder_id) VALUES ($1, $2, $3) RETURNING *",
      [name, projectId, parentId || null],
    );
    return { ...result.rows[0], type: "file" };
  }
};

/**
 * Renames a file or folder.
 */
export const renameFileOrFolder = async (
  id: string,
  type: "file" | "folder",
  name: string,
) => {
  const table = type === "folder" ? "folders" : "files";
  const result = await pool.query(
    `UPDATE ${table} SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [name, id],
  );
  return result.rows[0];
};

/**
 * Updates the content of a specific file (used for code synchronization).
 */
export const updateFileContent = async (id: string, content: string) => {
  const result = await pool.query(
    "UPDATE files SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [content, id],
  );
  return result.rows[0];
};

/**
 * Deletes a file or folder.
 * Includes a safety check to prevent deleting the project root folder.
 */
export const deleteFile = async (id: string, type: "file" | "folder") => {
  // 1. Safety Check: If it's a folder, check if it's a root folder
  if (type === "folder") {
    const folderCheck = await pool.query(
      "SELECT parent_id FROM folders WHERE id = $1",
      [id],
    );

    if (folderCheck.rowCount === 0) return false; // Folder doesn't exist

    // If parent_id is NULL, it's a root-level folder.
    // You might want to block this to prevent breaking the IDE tree.
    if (folderCheck.rows[0].parent_id === null) {
      throw new Error("ROOT_DELETE_FORBIDDEN");
    }
  }

  // 2. Proceed with Deletion
  const table = type === "folder" ? "folders" : "files";
  const result = await pool.query(
    `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
    [id],
  );

  return result.rowCount !== null && result.rowCount > 0;
};
