export type TileStatus = "hidden" | "mine" | "number" | "marked";

export interface Position {
  x: number;
  y: number;
}

export interface Tile extends Position {
  mine: boolean;
  adjacentMinesCount: number;
  status: TileStatus;
}

export interface GameState {
  board: Tile[][];
  gameStatus: "playing" | "won" | "lost";
  minesLeft: number;
  startTime: Date;
  endTime?: Date;
}
