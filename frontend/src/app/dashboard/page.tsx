'use client'

import withAuth from '@/hoc/withAuth'
import { useRouter } from 'next/navigation'
import { useDashboardLogic } from './hooks/useDashboardLogic'
import DashboardView from './components/DashboardView'

function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useDashboardLogic()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return <DashboardView user={user} onLogout={handleLogout} />
}

export default withAuth(DashboardPage)
