// app/layout.tsx
import type { Metadata } from 'next'

const BARBEIRO_NOME = process.env.NEXT_PUBLIC_BARBEIRO_NOME ?? 'Barbearia Premium'

export const metadata: Metadata = {
  title: BARBEIRO_NOME,
  description: 'Agendamento online de cortes masculinos',
  robots: 'noindex, nofollow', // privacidade: não indexar pelo Google
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
