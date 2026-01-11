import { TreeNode } from "../types/tree";

export const generateMockChildren = (
  parentId: string,
  level: string
): TreeNode[] => {
  const nextLevel = String.fromCharCode(level.charCodeAt(0) + 1);
  const count = Math.floor(Math.random() * 3) + 2;

  return Array.from({ length: count }, (_, i) => ({
    id: `${parentId}-${i}`,
    label: `Level ${nextLevel}`,
    level: nextLevel as TreeNode["level"],
    hasChildren: nextLevel < "G",
  }));
};

export const initialTreeData: TreeNode = {
  id: "root",
  label: "Level A",
  level: "A",
  isExpanded: false,
  children: [],
  hasChildren: true,
};

export const fetchChildren = (
  nodeId: string,
  level: string
): Promise<TreeNode[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockChildren(nodeId, level));
    }, 500);
  });
};

export const findNodeById = (
  node: TreeNode,
  targetId: string
): TreeNode | null => {
  if (node.id === targetId) return node;

  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }

  return null;
};

export const findParentNode = (
  node: TreeNode,
  targetId: string
): TreeNode | null => {
  if (node.children) {
    for (const child of node.children) {
      if (child.id === targetId) return node;
      const found = findParentNode(child, targetId);
      if (found) return found;
    }
  }

  return null;
};

export const removeNode = (node: TreeNode, targetId: string): TreeNode => {
  if (!node.children) return node;

  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== targetId)
      .map((child) => removeNode(child, targetId)),
  };
};

export const updateNode = (
  node: TreeNode,
  targetId: string,
  updates: Partial<TreeNode>
): TreeNode => {
  if (node.id === targetId) {
    return { ...node, ...updates };
  }

  if (node.children) {
    return {
      ...node,
      children: node.children.map((child) =>
        updateNode(child, targetId, updates)
      ),
    };
  }

  return node;
};

export const addChildNode = (
  node: TreeNode,
  parentId: string,
  newNode: TreeNode
): TreeNode => {
  if (node.id === parentId) {
    return {
      ...node,
      children: [...(node.children || []), newNode],
      isExpanded: true,
    };
  }

  if (node.children) {
    return {
      ...node,
      children: node.children.map((child) =>
        addChildNode(child, parentId, newNode)
      ),
    };
  }

  return node;
};

export const moveNode = (
  tree: TreeNode,
  sourceId: string,
  targetParentId: string,
  targetIndex: number
): TreeNode => {
  const nodeToMove = findNodeById(tree, sourceId);
  if (!nodeToMove) return tree;

  const updatedTree = removeNode(tree, sourceId);

  const targetParent =
    targetParentId === "root"
      ? updatedTree
      : findNodeById(updatedTree, targetParentId);
  if (!targetParent) return tree;

  if (targetParent.id === updatedTree.id) {
    const children = [...(updatedTree.children || [])];
    children.splice(targetIndex, 0, nodeToMove);
    return { ...updatedTree, children };
  } else {
    return updateNode(updatedTree, targetParentId, {
      children: [
        ...(targetParent.children || []).slice(0, targetIndex),
        nodeToMove,
        ...(targetParent.children || []).slice(targetIndex),
      ],
      isExpanded: true,
    });
  }
};
