import { Link } from 'react-router-dom'
import { FiLogIn, FiUser } from 'react-icons/fi'

import logo from '@/assets/logo.svg'
import { useContextAuth } from '@/contexts/authProvider'

export function Header() {
  const { signed } = useContextAuth()

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="flex w-full max-w-7xl items-center justify-between px-4">
        <Link to="/">
          <img src={logo} alt="logo do site" />
        </Link>

        {signed && (
          <Link to="/dashboard">
            <div className="rounded-full p-1 border-gray-900 border-2 flex justify-center items-center">
              <FiUser size={22} color="#000" />
            </div>
          </Link>
        )}

        {!signed && (
          <Link to="/sign-in">
            <FiLogIn size={22} color="#000" />
          </Link>
        )}
      </header>
    </div>
  )
}
