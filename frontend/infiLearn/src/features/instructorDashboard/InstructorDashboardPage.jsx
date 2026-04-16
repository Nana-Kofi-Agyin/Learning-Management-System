import heroImg from '../../assets/hero.svg'
import InstructorMain from './sections/InstructorMain'
import InstructorTopbar from './sections/InstructorTopbar'

function InstructorDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <InstructorTopbar />
      <InstructorMain heroImg={heroImg} />
    </div>
  )
}

export default InstructorDashboardPage
