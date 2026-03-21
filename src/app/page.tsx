import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import AboutSection from '@/components/sections/AboutSection';
import FaqSection from '@/components/sections/FaqSection';
import PricingSection from '@/components/sections/PricingSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import BookingSection from '@/components/sections/BookingSection';

export const metadata: Metadata = {
  title: 'Roli - Csontkovács és Manuálterápia | Józsa',
  description: 'Roli csontkovács Józsán – fájdalommentes élet derék-, nyak- és ízületi panaszok esetén. Foglalj időpontot online!',
  alternates: { canonical: 'https://rolicsontkovacs.hu' },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <FaqSection />
      <PricingSection />
      <ReviewsSection />
      <BookingSection />
    </>
  );
}
