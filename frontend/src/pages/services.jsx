import React from 'react';
import { 
  ArrowLeft,
  Bus,
  Shield,
  Calendar,
  Headphones,
  Users,
  Wifi,
  Tv,
  Snowflake,
  Package,
  Coffee,
  Zap,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images (you'll need to adjust paths as needed)
import buspic2 from "../assets/buspic2.webp";
import buspic4 from "../assets/buspic4.webp";
import busimg5 from "../assets/busimg5.jpg";
import busimg6 from "../assets/busimg6.webp";

const Services = () => {
  const navigate = useNavigate();

  // Footer Component from HomePage
  const Footer = () => {
    return (
      <footer className="w-full px-6 lg:px-8 py-12 bg-gradient-to-br from-blue-100 to-cyan-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-5 col-span-2">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-cyan-400 w-4 h-4 rounded-full"></div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  BusZone+
                </div>
                <div className="text-xs text-blue-600/70">
                  Premium Bus Rentals
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-base font-normal pr-10">
              Experience luxury, reliability, and comfort with our premium bus rental services. 
              We provide exceptional transportation solutions for all your needs.
            </p>
          </div>

          <div className="space-y-5">
            <h1 className="text-lg font-medium text-slate-800">About Us</h1>
            <ul className="space-y-3 text-slate-600 text-base font-normal">
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>About Us</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Contact Us</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Privacy Policy</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Terms and Conditions</a>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h1 className="text-lg font-medium text-slate-800">Services</h1>
            <ul className="space-y-3 text-slate-600 text-base font-normal">
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Safety Guarantee</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>FAQ & Support</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Luxury Buses</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-600 ease-in-out duration-300'>Enough Facilities</a>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h1 className="text-lg font-medium text-slate-800">Get In Touch</h1>
            <div className="space-y-4">
              <div className="flex gap-x-3">
                <MapPin className='text-lg text-blue-600 mt-1 flex-shrink-0' />
                <div className="flex flex-col">
                  <p className="text-sm text-slate-600">
                    For Support & Reservations
                  </p>
                  <p className="text-sm text-slate-700">
                    123, Main Street, Anytown, USA
                  </p>
                </div>
              </div>

              <div className="flex gap-x-3">
                <Phone className='text-lg text-blue-600 mt-1 flex-shrink-0' />
                <div className="flex flex-col">
                  <p className="text-sm text-slate-600">
                    Call Us Anytime
                  </p>
                  <p className="text-sm text-slate-700">
                    +94 704 222 777
                  </p>
                </div>
              </div>

              <div className="flex gap-x-3">
                <Mail className='text-lg text-blue-600 mt-1 flex-shrink-0' />
                <div className="flex flex-col">
                  <p className="text-sm text-slate-600">
                    Email Us
                  </p>
                  <p className="text-sm text-slate-700">
                    info@buszoneplus.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-blue-200 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} BusZone+. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 text-slate-800">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-blue-200/50 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  BusZone+
                </div>
                <div className="text-xs text-blue-600/70">Premium Bus Rentals</div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-blue-600 hover:text-cyan-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Darkened Image */}
      <div className="relative py-0 overflow-hidden">
        <div className="relative h-96 w-full">
          <div className="absolute inset-0 bg-black/70 z-10"></div>
          <img 
            src={buspic2} 
            alt="BusZone+ Services" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Our <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover our comprehensive range of bus services designed to meet all your transportation needs with comfort and reliability.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Services Categories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Our Service Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Executive Luxury */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-6">
                <img 
                  src={buspic4} 
                  alt="Executive Luxury Bus" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Executive Luxury</h3>
              <ul className="space-y-3 text-slate-600 mb-6">
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>20-25 Passengers</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Leather Seats</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Coffee className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Onboard Restroom</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Tv className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>4K Entertainment</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Conference Tables</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300">
                View Details
              </button>
            </div>

            {/* Premium Coach */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-6">
                <img 
                  src={busimg5} 
                  alt="Premium Coach Bus" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Premium Coach</h3>
              <ul className="space-y-3 text-slate-600 mb-6">
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>40-50 Passengers</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Reclining Seats</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Package className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Overhead Storage</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Wifi className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>WiFi Connectivity</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Snowflake className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Climate Control</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300">
                View Details
              </button>
            </div>

            {/* Mini Party Bus */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-blue-200/50 hover:border-blue-400/50 transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="mb-6">
                <img 
                  src={busimg6} 
                  alt="Mini Party Bus" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Mini Party Bus</h3>
              <ul className="space-y-3 text-slate-600 mb-6">
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>15-18 Passengers</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>LED Lighting</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Tv className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Sound System</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Coffee className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Bar Setup</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Dance Floor</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Services Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Our Additional Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Luggage Service */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Luggage Service</h3>
              </div>
              <p className="text-slate-600">
                We offer luggage services for our passengers, providing a secure and convenient option for transporting their belongings.
              </p>
            </div>

            {/* Online Booking */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Online Booking</h3>
              </div>
              <p className="text-slate-600">
                Bus companies usually have user-friendly websites or mobile apps that allow passengers to book tickets or charter services online.
              </p>
            </div>

            {/* Customer Support */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4 shadow-lg">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Customer Support</h3>
              </div>
              <p className="text-slate-600">
                Bus companies typically have customer support teams that can assist passengers with inquiries, ticket changes, and other concerns.
              </p>
            </div>

            {/* Public Transport */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Public Transport</h3>
              </div>
              <p className="text-slate-600">
                Our public transport services are meticulously designed to meet the diverse needs of daily commuters, offering a comprehensive, efficient, and user-friendly network of bus routes. We are committed to providing a seamless and reliable transportation experience, placing a strong emphasis on punctuality, safety, and affordability.
              </p>
            </div>

            {/* Special Hires */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-lg md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4 shadow-lg">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Special Hires</h3>
              </div>
              <p className="text-slate-600 mb-4">
                "Our bus special hire services offer a variety of options to suit different needs and preferences, including semi luxury, luxury, and super luxury types. Whether you're planning a corporate event, a group outing, or a special occasion, we have buses with various seating capacities to accommodate your group size comfortably. Our semi-luxury buses provide a blend of comfort and affordability, while our luxury buses offer enhanced features for a more refined travel experience. For those seeking the ultimate in comfort and style, our super luxury buses are equipped with top-of-the-line amenities. To learn more about our special hire services or to make a booking, please contact us.
              </p>
              
              <h4 className="text-xl font-semibold mt-6 mb-4 text-slate-800">Amenities in our luxury buses</h4>
              <p className="text-slate-600 mb-4">
                Our buses are equipped with state-of-the-art features to ensure a safe and comfortable traveling experience for our passengers. Some of the key features of our buses include CCTV cameras for passenger safety, experienced drivers, and comfortable seating arrangements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Snowflake className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-600">Fully Air-Conditioned</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Package className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-600">Significant Undercarriage Storage</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Tv className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-600">TV</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Wifi className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-600">High Speed Internet Facility</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Coffee className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-600">Cool Box</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-1 rounded mr-3">
                    <Zap className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-600">Reclining, Comfortable Seats with USB Charging Point</span>
                </div>
              </div>
              
              <p className="text-slate-600 mt-6">
                Our comprehensive attention to detail assures you a smooth and hassle-free traveling experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Book Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Contact us now to discuss your transportation needs and get a personalized quote.
          </p>
          
          <button 
            onClick={() => navigate('/contact')}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Footer from AboutUs Page */}
      <Footer />
    </div>
  );
};

export default Services;