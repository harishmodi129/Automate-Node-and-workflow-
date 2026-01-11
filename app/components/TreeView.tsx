"use client";

import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TreeNodeComponent from "./TreeNode";
import { TreeNode } from "../types/tree";
import {
  initialTreeData,
  fetchChildren,
  updateNode,
  addChildNode,
  removeNode,
  moveNode,
  findNodeById,
} from "../utils/treeUtils";
import { RefreshCw, Download, Upload } from "lucide-react";

interface TreeViewProps {
  initialData?: TreeNode;
  onDataChange?: (data: TreeNode) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  initialData = initialTreeData,
  onDataChange,
}) => {
  const [treeData, setTreeData] = useState<TreeNode>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Update tree data and notify parent
  const updateTree = useCallback(
    (newTree: TreeNode) => {
      setTreeData(newTree);
      onDataChange?.(newTree);
    },
    [onDataChange]
  );

  // Toggle node expansion with lazy loading
  const handleToggle = useCallback(
    async (nodeId: string) => {
      const node = findNodeById(treeData, nodeId);
      if (!node) return;

      if (
        !node.isExpanded &&
        node.hasChildren &&
        (!node.children || node.children.length === 0)
      ) {
        // Lazy load children
        updateTree(updateNode(treeData, nodeId, { isLoading: true }));

        try {
          const children = await fetchChildren(nodeId, node.level);
          updateTree(
            updateNode(treeData, nodeId, {
              children,
              isExpanded: true,
              isLoading: false,
            })
          );
        } catch (error) {
          console.error("Failed to load children:", error);
          updateTree(updateNode(treeData, nodeId, { isLoading: false }));
        }
      } else {
        // Simple toggle
        updateTree(
          updateNode(treeData, nodeId, {
            isExpanded: !node.isExpanded,
          })
        );
      }
    },
    [treeData, updateTree]
  );

  // Add new child node
  const handleAddChild = useCallback(
    (parentId: string, label: string) => {
      const parent = findNodeById(treeData, parentId);
      if (!parent) return;

      const nextLevel = String.fromCharCode(parent.level.charCodeAt(0) + 1);
      const newNode: TreeNode = {
        id: `${parentId}-${Date.now()}`,
        label,
        level: nextLevel as TreeNode["level"],
        hasChildren: nextLevel < "G",
      };

      updateTree(addChildNode(treeData, parentId, newNode));
    },
    [treeData, updateTree]
  );

  // Remove node
  const handleRemove = useCallback(
    (nodeId: string) => {
      if (nodeId === "root") {
        alert("Cannot delete root node");
        return;
      }
      updateTree(removeNode(treeData, nodeId));
    },
    [treeData, updateTree]
  );

  // Edit node label
  const handleEdit = useCallback(
    (nodeId: string, newLabel: string) => {
      updateTree(updateNode(treeData, nodeId, { label: newLabel }));
    },
    [treeData, updateTree]
  );

  // Move node (drag and drop)
  const handleMove = useCallback(
    (sourceId: string, targetParentId: string, targetIndex: number) => {
      updateTree(moveNode(treeData, sourceId, targetParentId, targetIndex));
    },
    [treeData, updateTree]
  );

  // Reset tree
  const handleReset = useCallback(() => {
    setTreeData(initialTreeData);
  }, []);

  // Export tree data
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(treeData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "tree-data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [treeData]);

  // Import tree data
  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setTreeData(data);
        } catch (error) {
          alert("Invalid file format");
        }
      };
      reader.readAsText(file);
    },
    []
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Tree View Component
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset tree"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export tree"
            >
              <Download size={18} />
            </button>
            <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <Upload size={18} />
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <TreeNodeComponent
              node={treeData}
              depth={0}
              onToggle={handleToggle}
              onAddChild={handleAddChild}
              onRemove={handleRemove}
              onEdit={handleEdit}
              onMove={handleMove}
              parentId={null}
              index={0}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="space-y-1">
            <li>• Click chevron or node to expand/collapse</li>
            <li>• Double-click node label to edit</li>
            <li>• Click + to add child node</li>
            <li>• Click × to delete node (with confirmation)</li>
            <li>• Drag and drop nodes to reorder or move</li>
            <li>• Children are loaded lazily when first expanded</li>
            <li>• Use toolbar buttons to reset/export/import tree</li>
          </ul>
        </div>
      </div>
    </DndProvider>
  );
};

export default TreeView;
