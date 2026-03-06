import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import LoginPage from './pages/LoginPage'
import AppPage from './pages/AppPage'

function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <AppPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  )
}

export default App
