import heroImg from '../../assets/hero.png'
import InstructorMain from './sections/InstructorMain'
import InstructorSidebar from './sections/InstructorSidebar'
import InstructorTopbar from './sections/InstructorTopbar'

function InstructorDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f3f4fb] text-slate-900">
      <div className="flex min-h-screen">
        <InstructorSidebar />

        <div className="min-w-0 flex-1">
          <InstructorTopbar />
          <InstructorMain heroImg={heroImg} />
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboardPage
