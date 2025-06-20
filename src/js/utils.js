/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const topRow = index < boardSize;
  const bottomRow = index >= boardSize * (boardSize - 1);
  const leftColumn = index % boardSize === 0;
  const rightColumn = (index + 1) % boardSize === 0;

  if (topRow && leftColumn) return 'top-left';
  if (topRow && rightColumn) return 'top-right';
  if (topRow) return 'top';

  if (bottomRow && leftColumn) return 'bottom-left';
  if (bottomRow && rightColumn) return 'bottom-right';
  if (bottomRow) return 'bottom';

  if (leftColumn) return 'left';
  if (rightColumn) return 'right';

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
