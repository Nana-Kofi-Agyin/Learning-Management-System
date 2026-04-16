import heroImg from '../../assets/hero.svg'
import CtaSection from './sections/CtaSection'
import Header from './sections/Header'
import HeroSection from './sections/HeroSection'
import JourneySection from './sections/JourneySection'
import ModulesSection from './sections/ModulesSection'

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <Header />
        <HeroSection heroImg={heroImg} />
        <ModulesSection heroImg={heroImg} />
        <JourneySection heroImg={heroImg} />
        <CtaSection />
      </main>
    </div>
  )
}

export default HomePage
