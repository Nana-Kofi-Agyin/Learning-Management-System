import heroImg from '../../assets/hero.png'
import MainPanel from './sections/MainPanel'
import RightRail from './sections/RightRail'
import Sidebar from './sections/Sidebar'
import Topbar from './sections/Topbar'

function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f3f4fb] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:px-8">
            <MainPanel heroImg={heroImg} />
            <RightRail />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
