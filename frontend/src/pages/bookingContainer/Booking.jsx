import React from 'react'
import Hero from './hero/Hero'
import Navbar from '../../components/navbar/Navbar'
import Footer from '../../components/footer/Footer'
import { Search } from 'lucide-react'
import Offer from './offer/Offer'
import Category from './category/Category'

const Booking = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Search />
      <Category />
      <Offer />
      <Footer />
    </div>
  )
}

export default Booking
