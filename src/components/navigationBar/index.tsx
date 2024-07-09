import { auth } from '@/services/firebase'
import { signOut } from 'firebase/auth'
import { FiLogOut } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export function NavigationBar() {
  return (
    <nav className="mb-4 w-full items-center flex h-10 gap-4 bg-red-500 rounded-lg justify-between px-2 text-white font-medium">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/dashboard/new">Novo Carro</Link>

      <button
        onClick={async () => await signOut(auth)}
        className="flex items-center gap-1 ml-auto"
      >
        <FiLogOut />
      </button>
    </nav>
  )
}
