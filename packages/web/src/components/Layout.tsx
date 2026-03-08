import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.js";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            Patchwork
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">
              Dashboard
            </Link>
            {user && (
              <>
                <span className="text-gray-400">{user.email}</span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
