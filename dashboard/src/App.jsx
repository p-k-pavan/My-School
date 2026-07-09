import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './layout/ProtectedRoute'
import RedirectIfAuthenticated from './layout/RedirectIfAuthenticated'
import Layout from './layout/Layout'

const Login = lazy(() => import('./pages/auth/Login'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const DashBoard = lazy(() => import('./pages/dashboard'))
const Admissions = lazy(() => import('./pages/Admission/admissions'))
const AdmissionForm = lazy(() => import('./pages/Admission/AdmissionForm'))
const Classes = lazy(() => import('./pages/Classes'))
const Teachers = lazy(() => import('./pages/Teachers'))
const Parents = lazy(() => import('./pages/Parents'))
const Students = lazy(() => import('./pages/Students'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Subjects = lazy(() => import('./pages/Subjects'))
const Timetable = lazy(() => import('./pages/Timetable'))
const Homework = lazy(() => import('./pages/Homework'))
const Fees = lazy(() => import('./pages/Fees'))
const Feed = lazy(() => import('./pages/Feed'))
const Profile = lazy(() => import('./pages/Profile'))

const LoadingFallback = () => (
  <div className="flex min-h-75 w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-xs font-semibold text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>

            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
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
              <Route path="/homework" element={<Homework />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

          </Routes>
        </Suspense>
      </Layout>
    </>
  )
}

export default App
