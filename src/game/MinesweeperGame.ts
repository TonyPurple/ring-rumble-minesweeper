import { GameState, Position, Tile } from "./types";

export class MinesweeperGame {
  private state: GameState;
  private readonly boardSize: number;
  private readonly totalMines: number;

  constructor(boardSize: number, totalMines: number) {
    this.boardSize = boardSize;
    this.totalMines = totalMines;
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    const board: Tile[][] = [];

    for (let x = 0; x < this.boardSize; x++) {
      board[x] = [];
      for (let y = 0; y < this.boardSize; y++) {
        board[x][y] = {
          x,
          y,
          mine: false,
          status: "hidden",
          adjacentMinesCount: 0,
        };
      }
    }

    return {
      board,
      gameStatus: "playing",
      minesLeft: this.totalMines,
      startTime: new Date(),
    };
  }

  private placeMines(excludedPosition: Position): void {
    const minePositions: Position[] = [];
    while (minePositions.length < this.totalMines) {
      const position = {
        x: Math.floor(Math.random() * this.boardSize),
        y: Math.floor(Math.random() * this.boardSize),
      };

      if (
        (position.x !== excludedPosition.x ||
          position.y !== excludedPosition.y) &&
        !minePositions.some((p) => p.x === position.x && p.y === position.y)
      ) {
        minePositions.push(position);
      }
    }

    minePositions.forEach(({ x, y }) => {
      this.state.board[x][y].mine = true;
    });

    // Update adjacent mines count
    this.state.board.forEach((row, x) =>
      row.forEach((tile, y) => {
        if (!tile.mine) {
          tile.adjacentMinesCount = this.countAdjacentMines(x, y);
        }
      })
    );
  }

  private countAdjacentMines(x: number, y: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newX = x + i;
        const newY = y + j;
        if (
          newX >= 0 &&
          newX < this.boardSize &&
          newY >= 0 &&
          newY < this.boardSize &&
          this.state.board[newX][newY].mine
        ) {
          count++;
        }
      }
    }
    return count;
  }

  public revealTile(x: number, y: number): void {
    if (this.state.gameStatus !== "playing") return;

    const tile = this.state.board[x][y];
    if (tile.status !== "hidden") return;

    if (!this.state.board.some((row) => row.some((t) => t.mine))) {
      this.placeMines({ x, y });
    }

    if (tile.mine) {
      this.revealAllMines();
      this.state.gameStatus = "lost";
      this.state.endTime = new Date();
      return;
    }

    this.floodFillReveal(x, y);
    this.checkWinCondition();
  }

  private floodFillReveal(x: number, y: number): void {
    const tile = this.state.board[x][y];
    if (tile.status !== "hidden") return;

    tile.status = "number";

    if (tile.adjacentMinesCount === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newX = x + i;
          const newY = y + j;
          if (
            newX >= 0 &&
            newX < this.boardSize &&
            newY >= 0 &&
            newY < this.boardSize
          ) {
            this.floodFillReveal(newX, newY);
          }
        }
      }
    }
  }

  public toggleFlag(x: number, y: number): void {
    if (this.state.gameStatus !== "playing") return;
    
    const tile = this.state.board[x][y];
    if (tile.status === "hidden") {
      tile.status = "marked";
      this.state.minesLeft--;
    } else if (tile.status === "marked") {
      tile.status = "hidden";
      this.state.minesLeft++;
    }
  }

  private revealAllMines(): void {
    this.state.board.forEach((row) => {
      row.forEach((tile) => {
        if (tile.mine) {
          tile.status = "mine";
        }
      });
    });
  }

  private checkWinCondition(): void {
    const won = this.state.board.every((row) =>
      row.every((tile) =>
        tile.mine
          ? tile.status === "marked" || tile.status === "hidden"
          : tile.status === "number"
      )
    );

    if (won) {
      this.state.gameStatus = "won";
      this.state.endTime = new Date();
    }
  }

  public getGameDuration(): number | null {
    if (!this.state.endTime) return null;
    return Math.floor((this.state.endTime.getTime() - this.state.startTime.getTime()) / 1000);
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = this.initializeGame();
  }
}
