import { auth } from '@/services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useContext,
} from 'react'

interface UserProps {
  uid: string
  name: string | null
  email: string | null
}

interface AuthContextProps {
  signed: boolean
  loadingAuth: boolean
  handleInfoUser: ({ uid, name, email }: UserProps) => void
  user: UserProps | null
}

const AuthContext = createContext({} as AuthContextProps)

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProps | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        })
        setLoadingAuth(false)
      } else {
        setUser(null)
        setLoadingAuth(false)
      }
    })

    return () => {
      unsub()
    }
  }, [])

  function handleInfoUser({ uid, name, email }: UserProps) {
    setUser({
      uid,
      name,
      email,
    })
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, loadingAuth, handleInfoUser, user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useContextAuth() {
  const context = useContext(AuthContext)
  return context
}

export { useContextAuth }
