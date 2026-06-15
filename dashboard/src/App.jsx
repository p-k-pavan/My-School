import { useState } from 'react'
import { Route, Routes } from 'react-router'
import Login from './pages/auth/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      

      
    </>
  )
}

export default App
