import React, { useState, useEffect } from "react";
import { MinesweeperGame } from "../game/MinesweeperGame";
import "./Minesweeper.css";

const WRESTLERS = [
  {
    name: "The Eliminator",
    icon: "🥊",
    tagline: "Knocking out the competition!",
  },
  {
    name: "The Masked Bomber",
    icon: "🎭",
    tagline: "Striking from the shadows!",
  },
  { name: "The Powerhouse", icon: "💪", tagline: "Unstoppable strength!" },
  { name: "The High Flyer", icon: "🤸", tagline: "Soaring to victory!" },
];

export default function Minesweeper() {
  const RING_SIZE = 10;
  const HEEL_WRESTLERS = 10;

  const [wrestler, setWrestler] = useState(WRESTLERS[0]);
  const [isChoosingWrestler, setIsChoosingWrestler] = useState(true);
  const [game] = useState(() => new MinesweeperGame(RING_SIZE, HEEL_WRESTLERS));
  const [gameState, setGameState] = useState(game.getState());
  const [elapsedTime, setElapsedTime] = useState(0);

  const OPPONENT_WRESTLERS = ["🦵", "💪", "🤼", "🎤", "🥋"];

  useEffect(() => {
    let intervalId: number;

    if (gameState.gameStatus === "playing") {
      intervalId = window.setInterval(() => {
        const now = new Date();
        const seconds = Math.floor(
          (now.getTime() - gameState.startTime.getTime()) / 1000
        );
        setElapsedTime(seconds);
      }, 1000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [gameState.gameStatus, gameState.startTime]);

  const handleTileClick = (x: number, y: number) => {
    game.revealTile(x, y);
    setGameState(game.getState());
  };

  const handleContextMenu = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    game.toggleFlag(x, y);
    setGameState(game.getState());
  };

  const handleWrestlerSelection = (wrestler: (typeof WRESTLERS)[0]) => {
    setWrestler(wrestler);
    setIsChoosingWrestler(false);
  };

  const resetGame = () => {
    game.reset();
    setGameState(game.getState());
    setElapsedTime(0);
  };

  const getNumberColor = (count: number) => {
    const colors = [
      "text-blue-500", // 1
      "text-green-500", // 2
      "text-red-500", // 3
      "text-purple-500", // 4
      "text-yellow-500", // 5
      "text-cyan-500", // 6
      "text-gray-500", // 7
      "text-pink-500", // 8
    ];
    return colors[count - 1] || "";
  };

  if (isChoosingWrestler) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mt-10">Choose Your Wrestler</h1>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {WRESTLERS.map((wrestlerOption) => (
            <button
              key={wrestlerOption.name}
              className="wrestler-card p-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-center"
              onClick={() => handleWrestlerSelection(wrestlerOption)}
            >
              <div className="text-5xl">{wrestlerOption.icon}</div>
              <div className="text-xl font-bold mt-2">
                {wrestlerOption.name}
              </div>
              <div className="text-sm mt-1">{wrestlerOption.tagline}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl mt-5 mb-5 font-bold">
        {wrestler.icon} {wrestler.name}
      </h1>
      <h3 className="text-lg italic mb-4">{wrestler.tagline}</h3>

      <div className="flex gap-8 text-[#CCC] text-2xl mb-2">
        <div>Opponent Wrestlers Left: {gameState.minesLeft}</div>
        <div>Ring Time: {elapsedTime}s</div>
      </div>

      {gameState.gameStatus !== "playing" && (
        <div
          className={`text-2xl mb-4 text-center font-bold ${
            gameState.gameStatus === "won"
              ? "text-green-500 animate-bounce"
              : "text-red-500 animate-pulse"
          }`}
        >
          {gameState.gameStatus === "won" ? (
            <>
              🎉 **And the winner is… YOU! 🏆 The crowd goes wild!**
              <br />
              <span className="text-lg">Survived in {elapsedTime}s</span>
            </>
          ) : (
            <>
              💥 **You’ve been pinned! Better luck next time!** 💀
              <br />
              <span className="text-lg">Keep training for the rematch!</span>
            </>
          )}
        </div>
      )}

      <button
        className="text-xl bg-red-700 hover:bg-red-800 px-4 py-2 rounded mb-4 transition-colors"
        onClick={resetGame}
      >
        Restart Match
      </button>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${RING_SIZE}, 60px)`,
          gridTemplateRows: `repeat(${RING_SIZE}, 60px)`,
        }}
      >
        {gameState.board.map((row, x) =>
          row.map((tile, y) => (
            <button
              key={`${x}-${y}`}
              data-status={tile.status}
              aria-label={
                tile.status === "hidden"
                  ? "Hidden tile"
                  : tile.status === "marked"
                  ? "Flagged tile"
                  : tile.status === "mine"
                  ? "Mine"
                  : `${tile.adjacentMinesCount} adjacent tiles`
              }
              onClick={() => handleTileClick(x, y)}
              onContextMenu={(e) => handleContextMenu(e, x, y)}
              className={`tile w-14 h-14 flex justify-center items-center border-2 rounded transition-colors
                ${
                  tile.status === "hidden"
                    ? "bg-gray-500 hover:bg-gray-400 cursor-pointer"
                    : tile.status === "mine"
                    ? "bg-red-500"
                    : tile.status === "marked"
                    ? "bg-yellow-400"
                    : "bg-gray-800"
                }`}
            >
              {tile.status === "number" && tile.adjacentMinesCount > 0 ? (
                <span
                  className={`${getNumberColor(
                    tile.adjacentMinesCount
                  )} font-bold`}
                >
                  {tile.adjacentMinesCount}
                </span>
              ) : tile.status === "marked" ? (
                "🏆"
              ) : tile.status === "mine" ? (
                OPPONENT_WRESTLERS[
                  Math.floor(Math.random() * OPPONENT_WRESTLERS.length)
                ]
              ) : (
                ""
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
