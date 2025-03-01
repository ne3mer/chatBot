import React from "react";
import RetroTerminalChat from "./components/RetroTerminalChat";
import "./App.css";

function App() {
  return (
    <div className="App crt-effect">
      <div className="scan-lines"></div>
      <RetroTerminalChat />
    </div>
  );
}

export default App;
