import { IBoard, defaultCell } from "../types/board.types";

export const buildBoard = ({ rows, columns }): IBoard => {
    const builtRows = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ ...defaultCell }))
    );
  
    return {
      cells: builtRows,
      size: { rows, columns },
      gameOver: false,
    };
};

export const getFramesPerGridCell = (level: number): number => {
  let framesPerGridCell = 0;
  if (level <= 9) {
      framesPerGridCell = 48 - level * 5;
  } else if (level <= 12) {
      framesPerGridCell = 5;
  } else if (level <= 15) {
      framesPerGridCell = 4;
  } else if (level <= 18) {
      framesPerGridCell = 3;
  } else if (level <= 28) {
      framesPerGridCell = 2;
  } else {
      framesPerGridCell = 1;
  }
  // framesPerGridCell / 2 because of tick rate
  return framesPerGridCell / 2;
}