"use client";

import React from "react";
import TreeView from "./components/TreeView";
import { TreeNode } from "./types/tree";
export default function TreeViewPage() {
  const handleDataChange = (data: TreeNode) => {
    console.log("Tree data changed:", data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <TreeView onDataChange={handleDataChange} />
      </div>
    </div>
  );
}
