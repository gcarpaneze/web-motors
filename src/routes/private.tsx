import { useContextAuth } from '@/contexts/authProvider'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { signed, loadingAuth } = useContextAuth()

  if (loadingAuth) {
    return <div></div>
  }

  if (!signed) {
    return <Navigate to="/sign-in" />
  }

  return children
}
