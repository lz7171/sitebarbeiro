// app/admin/page.tsx
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const metadata = {
  title: 'Painel Admin',
  robots: 'noindex, nofollow',
}

export default async function AdminPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin-login-secreto-nao-divulgar')

  return <AdminDashboard />
}
