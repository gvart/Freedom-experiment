import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./lib/auth.js";
import { ToastProvider } from "./components/Toast.js";
import { Layout } from "./components/Layout.js";
import { Dashboard } from "./pages/Dashboard.js";
import { ProjectPage } from "./pages/ProjectPage.js";
import { NewEntry } from "./pages/NewEntry.js";
import { EditEntry } from "./pages/EditEntry.js";
import { ProjectSettings } from "./pages/ProjectSettings.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";

function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard routes */}
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects/:slug" element={<ProjectPage />} />
              <Route path="/projects/:slug/new" element={<NewEntry />} />
              <Route path="/projects/:slug/entries/:id" element={<EditEntry />} />
              <Route path="/projects/:slug/settings" element={<ProjectSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
