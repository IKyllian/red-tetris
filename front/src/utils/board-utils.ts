import { IBoard, defaultCell } from "../types/board-types";

export const buildBoard = ({ rows, columns }): IBoard => {
    const builtRows = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ ...defaultCell }))
    );
  
    return {
      cells: builtRows,
      size: { rows, columns }
    };
};