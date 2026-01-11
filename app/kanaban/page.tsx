"use client";

import React from "react";
import KanbanBoard from "../components/KanbanBoard";
import { ColumnType } from "../types/types";

export default function KanbanPage() {
  const handleDataChange = (columns: ColumnType[]) => {
    console.log("Board data changed:", columns);
  };

  return <KanbanBoard onDataChange={handleDataChange} />;
}
