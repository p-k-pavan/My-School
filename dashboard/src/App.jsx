import { Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import DashBoard from "./pages/dashboard"
import ProtectedRoute from './layout/ProtectedRoute'
import RedirectIfAuthenticated from './layout/RedirectIfAuthenticated'
import Layout from './layout/Layout'
import Admissions from './pages/Admission/admissions'
import AdmissionForm from './pages/Admission/AdmissionForm'
import Classes from './pages/Classes'
import Teachers from './pages/Teachers'
import Parents from './pages/Parents'
import Students from './pages/Students'
import Attendance from './pages/Attendance'
import Subjects from './pages/Subjects'
import Timetable from './pages/Timetable'

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
            <Route path='/admissions' element={<Admissions />} />
            <Route path="/admissions/new" element={<AdmissionForm />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/timetable" element={<Timetable />} />
          </Route>

        </Routes>
      </Layout>
    </>
  )
}

export default App
