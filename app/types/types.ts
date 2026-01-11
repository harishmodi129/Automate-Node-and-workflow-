export interface CardType {
  id: string;
  title: string;
  columnId: string;
}

export interface ColumnType {
  id: string;
  title: string;
  cards: CardType[];
  color?: string;
}

export interface DragItem {
  cardId: string;
  columnId: string;
  index: number;
}

export interface KanbanBoardProps {
  initialData?: ColumnType[];
  onDataChange?: (columns: ColumnType[]) => void;
}

export interface ColumnProps {
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

export interface CardProps {
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
