export interface TreeNode {
  id: string;
  label: string;
  level: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  children?: TreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
  hasChildren?: boolean;
}

export interface DragItem {
  id: string;
  parentId: string | null;
  index: number;
}
