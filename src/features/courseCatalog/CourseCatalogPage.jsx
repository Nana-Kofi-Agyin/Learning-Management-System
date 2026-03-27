import heroImg from '../../assets/hero.png'
import CatalogContent from './sections/CatalogContent'
import CatalogSidebar from './sections/CatalogSidebar'
import CatalogTopbar from './sections/CatalogTopbar'

function CourseCatalogPage() {
  return (
    <div className="min-h-screen bg-[#f3f4fb] text-slate-900">
      <CatalogTopbar />
      <div className="mx-auto flex w-full max-w-[1400px]">
        <CatalogSidebar />
        <CatalogContent heroImg={heroImg} />
      </div>
    </div>
  )
}

export default CourseCatalogPage
