import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import AboutSection from '@/components/sections/AboutSection';
import PricingSection from '@/components/sections/PricingSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import BookingSection from '@/components/sections/BookingSection';

export const metadata: Metadata = {
  title: 'Roli - Csontkovacs Manualterapeuta Jozsa',
  description: 'Roli csontkovacs Jozsan – fajdalommentes elet derek, nyak es izuleti panaszok eseten.',
  alternates: { canonical: 'https://rolicsontkovacs.hu' },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <PricingSection />
      <ReviewsSection />
      <BookingSection />
    </>
  );
}
