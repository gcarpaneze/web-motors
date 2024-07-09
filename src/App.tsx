import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/home'
import { Dashboard } from './pages/dashboard'
import { New } from './pages/dashboard/new'
import { DetailsCars } from './pages/details-cars'
import { SignIn } from './pages/sign-in'
import { SignUp } from './pages/sign-up'
import { Layout } from './components/layout'
import { PrivateRoute } from './routes/private'

const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/details/:id',
        element: <DetailsCars />,
      },
      {
        path: '/dashboard',
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: '/dashboard/new',
        element: (
          <PrivateRoute>
            <New />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/sign-up',
    element: <SignUp />,
  },
])

export { router }
