import React from "react";
import ReactDOM from "react-dom/client";
import Minesweeper from "./components/Minesweeper";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Minesweeper />
  </React.StrictMode>
);
