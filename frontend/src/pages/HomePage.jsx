import React from 'react';
import { motion } from 'framer-motion';
import HeroSection        from '../components/home/HeroSection';
import FeaturedProperties from '../components/home/FeaturedProperties';
import CategoriesSection  from '../components/home/CategoriesSection';
import PopularLocations   from '../components/home/PopularLocations';
import WhyChooseUs        from '../components/home/WhyChooseUs';
import Testimonials       from '../components/home/Testimonials';

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col"
    >
      <HeroSection />
      <FeaturedProperties />
      <CategoriesSection />
      <PopularLocations />
      <WhyChooseUs />
      <Testimonials />
    </motion.div>
  );
}
