import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { Layout } from "./components/Layout.js";
import { Dashboard } from "./pages/Dashboard.js";
import { ProjectPage } from "./pages/ProjectPage.js";
import { NewEntry } from "./pages/NewEntry.js";
import { EditEntry } from "./pages/EditEntry.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/projects/:slug/new" element={<NewEntry />} />
          <Route path="/projects/:slug/entries/:id" element={<EditEntry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
