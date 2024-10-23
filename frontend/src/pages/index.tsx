import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { MenuProvider } from '../context/MenuContext'; // Ensure correct import path

import "./index.css";

import Layout from "../pages/layout/Layout";
import NoPage from "../pages/NoPage";
import Chat from "../pages/chat/Chat";

initializeIcons();

export default function App() {
  return (
    <MenuProvider> {/* Wrap everything with MenuProvider */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}> {/* Layout can access useMenu */}
            <Route index element={<Chat />} />   {/* Chat can also access useMenu */}
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </MenuProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
