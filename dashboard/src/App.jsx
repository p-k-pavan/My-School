import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Login from './pages/auth/Login'
import DashBoard from "./pages/dashboard"
import ProtectedRoute from './layout/ProtectedRoute'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>

        <Route path="/" element={<Login />} />


        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashBoard />} />
        </Route>

      </Routes>
    </>
  )
}

export default App
