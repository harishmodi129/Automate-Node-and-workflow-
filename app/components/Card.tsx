import React, { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { GripVertical, Edit2, X, Check, XCircle } from "lucide-react";
import { CardType, DragItem } from "../types/types";

interface CardProps {
  card: CardType;
  columnId: string;
  index: number;
  onDelete: (cardId: string) => void;
  onEdit: (cardId: string, newTitle: string) => void;
  onMove: (
    sourceColumnId: string,
    destColumnId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
}

const CardComponent: React.FC<CardProps> = ({
  card,
  columnId,
  index,
  onDelete,
  onEdit,
  onMove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(card.title);
  const [isHovered, setIsHovered] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef, dragPreview] = useDrag(() => ({
    type: "CARD",
    item: { cardId: card.id, columnId, index } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "CARD",
    hover: (item: DragItem, monitor) => {
      if (!cardRef.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumnId = item.columnId;
      const destColumnId = columnId;

      if (dragIndex === hoverIndex && sourceColumnId === destColumnId) {
        return;
      }

      const hoverBoundingRect = cardRef.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(sourceColumnId, destColumnId, dragIndex, hoverIndex);

      item.index = hoverIndex;
      item.columnId = destColumnId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  useEffect(() => {
    if (cardRef.current) {
      dropRef(cardRef.current);
      dragPreview(cardRef.current);
    }
  }, [dragPreview, dropRef]);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditValue(card.title);
  };

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue !== card.title) {
      onEdit(card.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(card.title);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(card.id);
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      ref={cardRef}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2
        transition-all duration-200 cursor-move
        ${isDragging ? "opacity-50 rotate-2" : ""}
        ${isOver ? "bg-blue-50 border-blue-300" : ""}
        hover:shadow-md
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2">
        <div
          ref={(node) => {
            if (node) dragRef(node);
          }}
          className="pt-1 cursor-move opacity-50 hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                ref={editInputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSubmit();
                  if (e.key === "Escape") handleEditCancel();
                }}
                onBlur={handleEditSubmit}
                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleEditSubmit}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleEditCancel}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                onMouseDown={(e) => e.preventDefault()}
              >
                <XCircle size={14} />
              </button>
            </div>
          ) : (
            <div
              className="text-sm text-gray-700 break-words cursor-text"
              onDoubleClick={handleEditStart}
            >
              {card.title}
            </div>
          )}
        </div>

        {!isEditing && (
          <div
            className={`flex gap-1 transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={handleEditStart}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end">
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
      </div>
    </div>
  );
};

export default CardComponent;
