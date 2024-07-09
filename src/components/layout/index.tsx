import { Outlet } from 'react-router-dom'
import { Header } from '@/components/header'

export function Layout() {
  return (
    <>
      <Header />
      <div className="w-full max-w-7xl mx-auto px-4">
        <Outlet />
      </div>
    </>
  )
}
