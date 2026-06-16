import { Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import DashBoard from "./pages/dashboard"
import ProtectedRoute from './layout/ProtectedRoute'
import RedirectIfAuthenticated from './layout/RedirectIfAuthenticated'
import Layout from './layout/Layout'

function App() {
  return (
    <>
      <Layout>
        <Routes>

          <Route element={<RedirectIfAuthenticated />}>
            <Route path="/" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashBoard />} />
          </Route>

        </Routes>
      </Layout>
    </>
  )
}

export default App
