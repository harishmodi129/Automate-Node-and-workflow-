"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { TreeNode as TreeNodeType, DragItem } from "../types/tree";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Edit2,
  Check,
  Loader2,
  GripVertical,
} from "lucide-react";

interface TreeNodeProps {
  node: TreeNodeType;
  depth: number;
  onToggle: (nodeId: string) => void;
  onAddChild: (parentId: string, label: string) => void;
  onRemove: (nodeId: string) => void;
  onEdit: (nodeId: string, newLabel: string) => void;
  onMove: (
    sourceId: string,
    targetParentId: string,
    targetIndex: number
  ) => void;
  parentId: string | null;
  index: number;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  depth,
  onToggle,
  onAddChild,
  onRemove,
  onEdit,
  onMove,
  parentId,
  index,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.label);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildLabel, setNewChildLabel] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Helper functions for drag and drop
  const isDescendant = (ancestorId: string, descendantId: string): boolean => {
    // This is a simplified check - in production, you'd need to traverse the tree
    return false;
  };

  const handleDrop = (item: DragItem) => {
    if (item.id !== node.id) {
      const targetIndex = node.children ? node.children.length : 0;
      onMove(item.id, node.id, targetIndex);
    }
  };

  // Drag and Drop setup
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: "TREE_NODE",
    item: { id: node.id, parentId, index } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "TREE_NODE",
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        handleDrop(item);
      }
    },
    canDrop: (item: DragItem) => {
      // Prevent dropping a node onto itself or its descendants
      if (item.id === node.id) return false;
      return !isDescendant(item.id, node.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Connect drag and drop refs
  useEffect(() => {
    drag(dragHandleRef);
    dragPreview(drop(ref));
  }, [drag, dragPreview, drop]);

  // Edit handlers
  const handleEditStart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setEditValue(node.label);
  };

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue !== node.label) {
      onEdit(node.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(node.label);
    setIsEditing(false);
  };

  // Add child handlers
  const handleAddChildStart = () => {
    setIsAddingChild(true);
    setNewChildLabel("");
  };

  const handleAddChildSubmit = () => {
    if (newChildLabel.trim()) {
      onAddChild(node.id, newChildLabel.trim());
      setNewChildLabel("");
      setIsAddingChild(false);
    }
  };

  const handleAddChildCancel = () => {
    setNewChildLabel("");
    setIsAddingChild(false);
  };

  // Delete handlers
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onRemove(node.id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isAddingChild && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingChild]);

  const nodeColor =
    {
      A: "bg-blue-500",
      B: "bg-green-500",
      C: "bg-green-500",
      D: "bg-green-500",
      E: "bg-green-500",
      F: "bg-green-500",
      G: "bg-green-500",
    }[node.level] || "bg-gray-500";

  return (
    <div className="select-none">
      <div
        ref={ref}
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors
          ${isDragging ? "opacity-50" : ""}
          ${isOver && canDrop ? "bg-blue-50 border-2 border-blue-300" : ""}
        `}
        style={{ marginLeft: `${depth * 24}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag handle */}
        <div
          ref={dragHandleRef}
          className="cursor-move opacity-50 hover:opacity-100"
        >
          <GripVertical size={16} />
        </div>

        {/* Expand/Collapse button */}
        {node.hasChildren && (
          <button
            onClick={() => onToggle(node.id)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={node.isExpanded ? "Collapse" : "Expand"}
          >
            {node.isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : node.isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
        {!node.hasChildren && <div className="w-6" />}

        {/* Node indicator */}
        <div
          className={`w-8 h-8 rounded-full ${nodeColor} flex items-center justify-center text-white font-semibold text-sm`}
        >
          {node.level}
        </div>

        {/* Node label */}
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSubmit();
              if (e.key === "Escape") handleEditCancel();
            }}
            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            onDoubleClick={handleEditStart}
            className="flex-1 cursor-text select-none"
          >
            {node.label}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <button
                onClick={handleEditStart}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                aria-label="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleAddChildStart}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                aria-label="Add child"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                aria-label="Delete"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="ml-12 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-2">
            Delete `{node.label}` and all its children?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteConfirm}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={handleDeleteCancel}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add child input */}
      {isAddingChild && (
        <div className="ml-12 mt-2 flex items-center gap-2">
          <input
            ref={addInputRef}
            type="text"
            value={newChildLabel}
            onChange={(e) => setNewChildLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChildSubmit();
              if (e.key === "Escape") handleAddChildCancel();
            }}
            placeholder="Enter node label..."
            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddChildSubmit}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            aria-label="Confirm add"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleAddChildCancel}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            aria-label="Cancel add"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Render children */}
      {node.isExpanded && node.children && (
        <div>
          {node.children.map((child, childIndex) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onRemove={onRemove}
              onEdit={onEdit}
              onMove={onMove}
              parentId={node.id}
              index={childIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNodeComponent;
