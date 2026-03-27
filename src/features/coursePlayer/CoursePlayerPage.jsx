import DiscussionSection from './sections/DiscussionSection'
import LessonHeader from './sections/LessonHeader'
import LessonSidebar from './sections/LessonSidebar'
import PlayerTopbar from './sections/PlayerTopbar'

function CoursePlayerPage() {
  return (
    <div className="min-h-screen bg-[#f3f4fb] text-slate-900">
      <PlayerTopbar />

      <div className="flex">
        <LessonSidebar />

        <div className="min-w-0 flex-1">
          <main className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
            <LessonHeader />
            <DiscussionSection />
          </main>
        </div>
      </div>
    </div>
  )
}

export default CoursePlayerPage
