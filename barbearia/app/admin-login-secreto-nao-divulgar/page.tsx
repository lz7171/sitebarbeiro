// app/admin-login-secreto-nao-divulgar/page.tsx
import AdminLoginClient from '@/components/admin/AdminLoginClient'

export const metadata = {
  title: 'Acesso Restrito',
  robots: 'noindex, nofollow',
}

export default function AdminLoginPage() {
  return <AdminLoginClient />
}
