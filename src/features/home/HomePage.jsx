import heroImg from '../../assets/hero.png'
import CtaSection from './sections/CtaSection'
import ExperienceSection from './sections/ExperienceSection'
import Footer from './sections/Footer'
import Header from './sections/Header'
import HeroSection from './sections/HeroSection'
import JourneySection from './sections/JourneySection'
import ModulesSection from './sections/ModulesSection'
import StatsSection from './sections/StatsSection'
import TestimonialsSection from './sections/TestimonialsSection'

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <Header />
        <HeroSection heroImg={heroImg} />
        <StatsSection />
        <ExperienceSection />
        <ModulesSection heroImg={heroImg} />
        <JourneySection heroImg={heroImg} />
        <TestimonialsSection />
        <CtaSection />
        <Footer />
      </div>
    </div>
  )
}

export default HomePage
