import type { Board, CardItem, Column } from '../types/kanban';

/**
 * Transforms a flat list of Tasks from Task-Service (MongoDB) into Board columns and cards map
 */
export const syncTasksIntoBoard = (board: Board, tasks: CardItem[]): Board => {
  const cardsMap: Record<string, CardItem> = {};
  const columnCardsMap: Record<string, string[]> = {};

  // Initialize column card arrays
  board.columns.forEach(col => {
    columnCardsMap[col.id] = [];
  });

  // Assign cards to appropriate columns
  tasks.forEach(task => {
    cardsMap[task.id] = task;
    const targetCol = task.columnId || board.columns[0]?.id || 'col-todo';
    if (!columnCardsMap[targetCol]) {
      columnCardsMap[targetCol] = [];
    }
    columnCardsMap[targetCol].push(task.id);
  });

  // Construct updated columns
  const updatedColumns: Column[] = board.columns.map(col => ({
    ...col,
    cardIds: columnCardsMap[col.id] || [],
  }));

  return {
    ...board,
    columns: updatedColumns,
    cards: cardsMap,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Extracts flat Task array from a Board structure
 */
export const extractTasksFromBoard = (board: Board): CardItem[] => {
  return Object.values(board.cards);
};
