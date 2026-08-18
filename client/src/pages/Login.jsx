import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Credenciales inválidas')
      }
      // Guardar token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      onSuccess?.(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/80 via-indigo-500/80 to-purple-500/80">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">⛽</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CacharreriaGasPOS</h1>
          <p className="text-gray-600 mt-1">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black" htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 h-12 bg-white/50 backdrop-blur-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 h-12 bg-white/50 backdrop-blur-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Ingresando…' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-2">Credenciales registradas en el sistema:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="fill-admin-btn"
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
              }}
              className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-left transition-colors text-blue-900"
            >
              <div className="font-semibold">👑 Admin</div>
              <div className="text-[11px] text-blue-700">admin / admin123</div>
            </button>
            <button
              id="fill-vendedor-btn"
              type="button"
              onClick={() => {
                setUsername('vendedor');
                setPassword('vendedor123');
              }}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-left transition-colors text-indigo-900"
            >
              <div className="font-semibold">💼 Vendedor</div>
              <div className="text-[11px] text-indigo-700">vendedor / vendedor123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
