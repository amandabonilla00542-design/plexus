import { HeroCarousel } from '../components/HeroCarousel'
import { MarqueeTicker } from '../components/MarqueeTicker'
import { StatsStrip } from '../components/StatsStrip'
import { TrustSecurityStrip } from '../components/TrustSecurityStrip'
import { FeatureGrid } from '../components/FeatureGrid'
import { HowItWorks } from '../components/HowItWorks'
import { MarketsProSection } from '../components/MarketsProSection'
import { PricingSnapshot } from '../components/PricingSnapshot'
import { HomeElonSpotlight } from '../components/HomeElonSpotlight'
import { DeskInsights } from '../components/DeskInsights'
import { HomeFaq } from '../components/HomeFaq'
import { CtaBand } from '../components/CtaBand'
import './Home.css'

export function Home() {
  return (
    <div className="home-page">
      <HeroCarousel />
      <MarqueeTicker />
      <StatsStrip />
      <MarketsProSection />
      <TrustSecurityStrip />
      <FeatureGrid />
      <HowItWorks />
      <PricingSnapshot />
      <HomeElonSpotlight />
      <DeskInsights />
      <HomeFaq />
      <CtaBand />
    </div>
  )
}
