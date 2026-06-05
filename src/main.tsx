import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400">
      <p className="text-lg">AI 小说转剧本工具 — 脚手架就绪</p>
    </div>
  </StrictMode>
);