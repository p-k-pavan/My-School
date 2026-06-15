import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Login from './pages/auth/Login'
import DashBoard from "./pages/dashboard"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>

         <Routes>
          <Route path="/dashboard" element={<DashBoard />} />
        </Routes>
      

      
    </>
  )
}

export default App
