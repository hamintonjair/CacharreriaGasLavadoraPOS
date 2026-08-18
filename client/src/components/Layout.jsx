import React from 'react';
import useCompany from '../hooks/useCompany.js';

export default function Layout({
  user,
  isAdmin,
  view,
  setView,
  onLogout,
  children,
}) {
  const { company, loading, error } = useCompany();

  // Obtener nombre de empresa o usar fallback
  const companyName = company?.name || 'CacharreriaGasPOS';

  return (
    <div className="min-h-screen grid grid-cols-12 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:block md:col-span-2 bg-gray-900 text-white">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="text-lg font-bold">Menú</div>
          </div>
          <nav className="p-3 space-y-2">
            {isAdmin && (
              <button
                onClick={() => setView("DASHBOARD")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "DASHBOARD"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                🏡 Dashboard
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setView("COMPANY")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "COMPANY"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                🏢 Empresa
              </button>
            )}
            <button
              onClick={() => setView("POS")}
              className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                view === "POS"
                  ? "bg-white text-gray-900"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              🛒 Venta / POS
            </button>
            {isAdmin && (
              <button
                onClick={() => setView("REPORTS")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "REPORTS"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                📈 Reportes
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setView("INVENTORY")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "INVENTORY"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                📦 Inventario
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setView("CATEGORIES")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "CATEGORIES"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                📁 Categorías
              </button>
            )}
            {(isAdmin || user?.role === "VENDEDOR") && (
              <button
                onClick={() => setView("CLIENTS")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "CLIENTS"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                👥 Clientes
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setView("USERS")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "USERS"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                👥 Usuarios
              </button>
            )}
            {(isAdmin || user?.role === "VENDEDOR") && (
              <button
                onClick={() => setView("WASHING_MACHINES")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "WASHING_MACHINES"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                🧺 Lavadoras
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setView("ACCOUNTS_RECEIVABLE")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "ACCOUNTS_RECEIVABLE"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                💰 Cuentas por Cobrar
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setView("RENTAL_REPORT")}
                className={`w-full h-12 rounded-lg px-3 text-left font-semibold ${
                  view === "RENTAL_REPORT"
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                📊 Historial de Alquileres
              </button>
            )}

            <div className="pt-2 border-t border-white/10 mt-3">
              <button
                onClick={onLogout}
                className="w-full h-12 rounded-lg px-3 text-left bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main area */}
      <div className="col-span-12 md:col-span-10 min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-3 sm:px-4 py-2.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
            {/* Business info */}
            <div className="flex items-center justify-between min-w-0">
              <div className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
                {companyName}
              </div>
              <div className="hidden md:block text-xs sm:text-sm text-gray-500 ml-3">
                Sesión iniciada como {user?.nombre || user?.username}
              </div>
            </div>

            {/* Mobile Navigation Selector & Logout */}
            <div className="md:hidden flex items-center gap-2 w-full">
              <select
                className="flex-1 h-9 min-w-0 border border-gray-300 rounded-lg px-2.5 text-xs sm:text-sm bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500"
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                {isAdmin && <option value="DASHBOARD">🏡 Dashboard</option>}
                {isAdmin && <option value="COMPANY">🏢 Empresa</option>}
                <option value="POS">🛒 Venta / POS</option>
                {isAdmin && <option value="REPORTS">📈 Reportes</option>}
                {isAdmin && <option value="INVENTORY">📦 Inventario</option>}
                {isAdmin && <option value="CATEGORIES">📁 Categorías</option>}
                {(isAdmin || user?.role === "VENDEDOR") && (
                  <option value="CLIENTS">👥 Clientes</option>
                )}
                {isAdmin && <option value="USERS">👥 Usuarios</option>}
                {(isAdmin || user?.role === "VENDEDOR") && (
                  <option value="WASHING_MACHINES">🧺 Lavadoras</option>
                )}
                {isAdmin && (
                  <option value="ACCOUNTS_RECEIVABLE">💰 Cuentas por Cobrar</option>
                )}
                {isAdmin && (
                  <option value="RENTAL_REPORT">📊 Historial Alquileres</option>
                )}
              </select>
              <button
                onClick={onLogout}
                className="h-9 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
