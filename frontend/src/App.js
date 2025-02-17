import { useEffect } from 'react'
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import { SessionProvider, useSession } from './Components/SessionContext'
import Drive from './Pages/Drive'
import Login from './Pages/Login'

const BASE_URL = 'http://localhost:5000'

function App() {
  const { token } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/')
    } else {
      navigate('/drive')
    }
  }, [token, navigate])

  return (
    <div>
      <Toaster
        position={'bottom-center'}
        richColors
      />
      <Routes>
        <Route
          path="/"
          element={<Login baseUrl={BASE_URL} />}
        />
        <Route
          path="/drive"
          element={<Drive baseUrl={BASE_URL} />}
        />
      </Routes>
    </div>
  )
}

function AppWithProvider() {
  return (
    <SessionProvider>
      <Router>
        <App />
      </Router>
    </SessionProvider>
  )
}

export default AppWithProvider
