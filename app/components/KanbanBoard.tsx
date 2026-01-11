import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus, RefreshCw, Download, Upload, X } from "lucide-react";
import ColumnComponent from "./Column";
import { ColumnType } from "../types/types";

interface KanbanBoardProps {
  initialData?: ColumnType[];
  onDataChange?: (columns: ColumnType[]) => void;
}

const initialColumns: ColumnType[] = [
  { id: "todo", title: "To Do", cards: [], color: "blue" },
  { id: "in-progress", title: "In Progress", cards: [], color: "orange" },
  { id: "done", title: "Done", cards: [], color: "green" },
];

const moveCard = (
  columns: ColumnType[],
  sourceColumnId: string,
  destColumnId: string,
  sourceIndex: number,
  destIndex: number
): ColumnType[] => {
  const newColumns = [...columns];
  const sourceCol = newColumns.find((col) => col.id === sourceColumnId);
  const destCol = newColumns.find((col) => col.id === destColumnId);

  if (!sourceCol || !destCol) return columns;

  const [movedCard] = sourceCol.cards.splice(sourceIndex, 1);
  destCol.cards.splice(destIndex, 0, movedCard);

  return newColumns;
};

const addCard = (
  columns: ColumnType[],
  columnId: string,
  title: string
): ColumnType[] => {
  return columns.map((col) => {
    if (col.id === columnId) {
      return {
        ...col,
        cards: [...col.cards, { id: `card-${Date.now()}`, title, columnId }],
      };
    }
    return col;
  });
};

const deleteCard = (columns: ColumnType[], cardId: string): ColumnType[] => {
  return columns.map((col) => ({
    ...col,
    cards: col.cards.filter((card) => card.id !== cardId),
  }));
};

const updateCard = (
  columns: ColumnType[],
  cardId: string,
  newTitle: string
): ColumnType[] => {
  return columns.map((col) => ({
    ...col,
    cards: col.cards.map((card) =>
      card.id === cardId ? { ...card, title: newTitle } : card
    ),
  }));
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialData = initialColumns,
  onDataChange,
}) => {
  const [columns, setColumns] = useState<ColumnType[]>(initialData);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const updateColumns = useCallback(
    (newColumns: ColumnType[]) => {
      setColumns(newColumns);
      onDataChange?.(newColumns);
    },
    [onDataChange]
  );

  const handleMoveCard = useCallback(
    (
      sourceColumnId: string,
      destColumnId: string,
      sourceIndex: number,
      destIndex: number
    ) => {
      const newColumns = moveCard(
        columns,
        sourceColumnId,
        destColumnId,
        sourceIndex,
        destIndex
      );
      updateColumns(newColumns);
    },
    [columns, updateColumns]
  );

  const handleAddCard = useCallback(
    (columnId: string, title: string) => {
      const newColumns = addCard(columns, columnId, title);
      updateColumns(newColumns);
    },
    [columns, updateColumns]
  );

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      const newColumns = deleteCard(columns, cardId);
      updateColumns(newColumns);
    },
    [columns, updateColumns]
  );

  const handleEditCard = useCallback(
    (cardId: string, newTitle: string) => {
      const newColumns = updateCard(columns, cardId, newTitle);
      updateColumns(newColumns);
    },
    [columns, updateColumns]
  );

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn: ColumnType = {
        id: `column-${Date.now()}`,
        title: newColumnTitle.trim(),
        cards: [],
        color: "gray",
      };
      updateColumns([...columns, newColumn]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this column? All cards in it will be lost."
      )
    ) {
      const newColumns = columns.filter((col) => col.id !== columnId);
      updateColumns(newColumns);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the board?")) {
      setColumns(initialColumns);
      onDataChange?.(initialColumns);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(columns, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "kanban-board.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setColumns(data);
        onDataChange?.(data);
      } catch (error) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Kanban Board
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {totalCards} total cards across {columns.length} columns
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reset board"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export board"
                >
                  <Download size={18} />
                </button>
                <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 md:gap-6 min-w-max">
              {columns.map((column) => (
                <div key={column.id} className="relative group">
                  <ColumnComponent
                    column={column}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onEditCard={handleEditCard}
                    onMoveCard={handleMoveCard}
                  />

                  {!["todo", "in-progress", "done"].includes(column.id) && (
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Delete column"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex-shrink-0">
                {isAddingColumn ? (
                  <div className="w-[300px] bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddColumn();
                        if (e.key === "Escape") {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }
                      }}
                      placeholder="Enter column title..."
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddColumn}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        Add Column
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnTitle("");
                        }}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="h-full min-h-[200px] w-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors bg-white bg-opacity-50"
                  >
                    <div className="text-center">
                      <Plus size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-medium">Add Column</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• Drag and drop cards between columns</div>
              <div>• Double-click or click edit icon to edit card</div>
              <div>• Click `Add Card` to create new cards</div>
              <div>• Click `Add Column` to create new columns</div>
              <div>• Click X to delete cards or columns</div>
              <div>• Cards reorder within the same column</div>
              <div>• Export/Import board state as JSON</div>
              <div>
                • Default columns (To Do, In Progress, Done) cannot be deleted
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
