import React from 'react';
import Hero from './hero/Hero';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import Search from './search/Search';
import Offer from './offer/Offer';
import Category from './category/Category';
import SeasonalOffers from '../../components/SeasonalOffers'; // Import the SeasonalOffers component

const Booking = () => {
  return (
    <div className="pt-16">
      <Navbar />
      <Hero />
      <Search />
      <Category />
      <Offer />
      <Footer />
    </div>
  );
};

export default Booking;