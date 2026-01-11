import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { MoreVertical, Plus } from "lucide-react";
import CardComponent from "./Card";
import { ColumnType, DragItem } from "../types/types";

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string, newTitle: string) => void;
  onMoveCard: (
    sourceColumnId: string,
    destColumnId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
}

const ColumnComponent: React.FC<ColumnProps> = ({
  column,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onMoveCard,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "CARD",
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop() && column.cards.length === 0) {
        onMoveCard(item.columnId, column.id, item.index, 0);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleAddCardStart = () => {
    setIsAddingCard(true);
    setNewCardTitle("");
  };

  const handleAddCardSubmit = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle("");
      setIsAddingCard(false);
    }
  };

  const handleAddCardCancel = () => {
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  useEffect(() => {
    if (isAddingCard && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingCard]);

  const getHeaderColor = () => {
    switch (column.id) {
      case "todo":
        return "bg-blue-500";
      case "in-progress":
        return "bg-orange-500";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg shadow-sm border border-gray-200 min-w-[300px] max-w-[350px] h-fit">
      <div className={`${getHeaderColor()} text-white p-3 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <span className="bg-white bg-opacity-30 text-xs px-2 py-1 rounded">
              {column.cards.length}
            </span>
          </div>
          <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div
        ref={(node) => {
          if (node) dropRef(node);
        }}
        className={`
          flex-1 p-3 min-h-[100px] transition-colors
          ${isOver && canDrop ? "bg-blue-50" : ""}
          ${column.cards.length === 0 ? "flex items-center justify-center" : ""}
        `}
      >
        {column.cards.length === 0 && !isAddingCard && (
          <div className="text-gray-400 text-sm text-center">
            {isOver ? "Drop card here" : "No cards yet"}
          </div>
        )}

        {column.cards.map((card, index: number) => (
          <CardComponent
            key={card.id}
            card={card}
            columnId={column.id}
            index={index}
            onDelete={onDeleteCard}
            onEdit={onEditCard}
            onMove={onMoveCard}
          />
        ))}

        {isAddingCard && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
            <input
              ref={addInputRef}
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCardSubmit();
                if (e.key === "Escape") handleAddCardCancel();
              }}
              placeholder="Enter card title..."
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddCardSubmit}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={handleAddCardCancel}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 pt-0">
        <button
          onClick={handleAddCardStart}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:bg-white hover:text-gray-800 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Card</span>
        </button>
      </div>
    </div>
  );
};

export default ColumnComponent;
