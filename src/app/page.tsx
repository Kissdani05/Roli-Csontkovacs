import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import AboutSection from '@/components/sections/AboutSection';
import FaqSection from '@/components/sections/FaqSection';
import PricingSection from '@/components/sections/PricingSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import FadeInView from '@/components/ui/FadeInView';

export const metadata: Metadata = {
  title: 'Roli - Csontkovács és Manuálterápia | Józsa',
  description: 'Roli csontkovács Józsán – fájdalommentes élet derék-, nyak- és ízületi panaszok esetén. Foglalj időpontot online!',
  alternates: { canonical: 'https://rolicsontkovacs.hu' },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FadeInView><AboutSection /></FadeInView>
      <FadeInView><ServicesSection /></FadeInView>
      <FadeInView><PricingSection /></FadeInView>
      <FadeInView><FaqSection /></FadeInView>
      <FadeInView><ReviewsSection /></FadeInView>
    </>
  );
}
