import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CoursePlayerPage from './features/coursePlayer/CoursePlayerPage'
import DashboardPage from './features/dashboard/DashboardPage'
import HomePage from './features/home/HomePage'
import InstructorDashboardPage from './features/instructorDashboard/InstructorDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/course-player" element={<CoursePlayerPage />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
