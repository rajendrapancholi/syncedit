import type { TreeNode } from "../types/file";

export class ProjectTreeService {
  private trees = new Map<string, TreeNode[]>(); // projectId -> tree

  /** Get the current tree for a project */
  getTree(projectId: string): TreeNode[] | undefined {
    return this.trees.get(projectId);
  }

  /** Set the tree explicitly (e.g., after fetching from DB) */
  setTree(projectId: string, tree: TreeNode[]): void {
    this.trees.set(projectId, tree);
  }

  /** Insert a new node into the tree */
  insertNode(projectId: string, node: TreeNode, parentId?: string): void {
    const tree = this.trees.get(projectId);
    if (!tree) {
      // If tree does not exist yet, create root array with the node
      this.trees.set(projectId, [node]);
      return;
    }

    if (!parentId || parentId === projectId) {
      tree.push(node); // root-level
    } else {
      this.insertNodeRecursive(tree, parentId, node);
    }
  }

  /** Recursive helper to insert node under the correct parent */
  private insertNodeRecursive(
    tree: TreeNode[],
    parentId: string,
    node: TreeNode
  ): boolean {
    for (const item of tree) {
      if (item.id === parentId && item.type === "folder") {
        if (!item.children) item.children = [];
        item.children.push(node);
        return true;
      }
      if (
        item.children &&
        this.insertNodeRecursive(item.children, parentId, node)
      ) {
        return true;
      }
    }
    return false; // parent not found
  }

  /** Update an existing node by ID */
  updateNode(
    projectId: string,
    nodeId: string,
    updatedData: Partial<TreeNode>
  ): void {
    const tree = this.trees.get(projectId);
    if (!tree) return;
    this.updateNodeRecursive(tree, nodeId, updatedData);
  }

  private updateNodeRecursive(
    tree: TreeNode[],
    nodeId: string,
    updatedData: Partial<TreeNode>
  ): boolean {
    for (const item of tree) {
      if (item.id === nodeId) {
        Object.assign(item, updatedData); // update the node
        return true;
      }
      if (
        item.children &&
        this.updateNodeRecursive(item.children, nodeId, updatedData)
      ) {
        return true;
      }
    }
    return false;
  }

  /** Optional: remove a node by ID */
  removeNode(projectId: string, nodeId: string): void {
    const tree = this.trees.get(projectId);
    if (!tree) return;
    this.trees.set(projectId, this.removeNodeRecursive(tree, nodeId));
  }

  private removeNodeRecursive(tree: TreeNode[], nodeId: string): TreeNode[] {
    return tree
      .filter((item) => item.id !== nodeId)
      .map((item) => ({
        ...item,
        children: item.children
          ? this.removeNodeRecursive(item.children, nodeId)
          : undefined,
      }));
  }
}

export const projectTreeService = new ProjectTreeService();
