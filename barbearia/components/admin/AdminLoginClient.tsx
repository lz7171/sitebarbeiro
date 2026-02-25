'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginClient() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (attempts >= 5) {
      setError('Muitas tentativas. Aguarde alguns minutos.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAttempts(a => a + 1)
        setError(data.error ?? 'Credenciais inválidas')
        setPassword('')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-white/60" />
          </div>
          <h1 className="text-lg font-semibold text-white">Acesso Restrito</h1>
          <p className="text-sm text-white/40 mt-1">Painel do barbeiro</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
              Usuário
            </label>
            <input
              className="input-dark"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                className="input-dark pr-10"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {attempts >= 3 && attempts < 5 && (
            <p className="text-[11px] text-yellow-400/60 text-center">
              {5 - attempts} tentativas restantes antes do bloqueio
            </p>
          )}

          <button
            type="submit"
            className="btn-ghost w-full"
            disabled={loading || attempts >= 5}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
