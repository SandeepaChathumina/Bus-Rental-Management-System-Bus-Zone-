import React from 'react';
import { 
  Users, 
  Shield, 
  Clock, 
  MapPin, 
  Award, 
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  Bus,
  Star,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import about from "../assets/about.jpg";

const AboutUs = () => {
  const navigate = useNavigate();

  const aboutImage = about;

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Your safety is our top priority. All our vehicles undergo regular maintenance and safety checks."
    },
    {
      icon: Clock,
      title: "Punctuality",
      description: "We pride ourselves on being on time, every time. Your schedule is important to us."
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "We go the extra mile to ensure your comfort and satisfaction throughout your journey."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards of service quality and professionalism."
    }
  ];

  const stats = [
    { number: "15+", label: "Years Experience", icon: Calendar },
    { number: "150+", label: "Premium Buses", icon: Bus },
    { number: "50,000+", label: "Happy Customers", icon: Users },
    { number: "99.8%", label: "On-Time Record", icon: TrendingUp }
  ];

  // Footer Component from HomePage
  const Footer = () => {
    return (
      <footer className="w-full px-6 lg:px-8 py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-5 col-span-2">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-cyan-400 w-4 h-4 rounded-full"></div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  BusZone+
                </div>
                <div className="text-xs text-slate-400">
                  Premium Bus Rentals
                </div>
              </div>
            </div>
            <p className="text-neutral-400 text-base font-normal pr-10">
              Experience luxury, reliability, and comfort with our premium bus rental services. 
              We provide exceptional transportation solutions for all your needs.
            </p>
          </div>

          <div className="space-y-5">
            <h1 className="text-lg font-medium text-white">About Us</h1>
            <ul className="space-y-3 text-neutral-400 text-base font-normal">
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>About Us</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>Contact Us</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>Privacy Policy</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>Terms and Conditions</a>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h1 className="text-lg font-medium text-white">Services</h1>
            <ul className="space-y-3 text-neutral-400 text-base font-normal">
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>Safety Guarantee</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>FAQ & Support</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>Luxury Buses</a>
              </li>
              <li>
                <a href="#" className='hover:text-blue-400 ease-in-out duration-300'>Enough Facilities</a>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h1 className="text-lg font-medium text-white">Get In Touch</h1>
            <div className="space-y-4">
              <div className="flex gap-x-3">
                <MapPin className='text-lg text-blue-400 mt-1 flex-shrink-0' />
                <div className="flex flex-col">
                  <p className="text-sm text-neutral-400">
                    For Support & Reservations
                  </p>
                  <p className="text-sm text-neutral-300">
                    123, Main Street, Anytown, USA
                  </p>
                </div>
              </div>

              <div className="flex gap-x-3">
                <Phone className='text-lg text-blue-400 mt-1 flex-shrink-0' />
                <div className="flex flex-col">
                  <p className="text-sm text-neutral-400">
                    Call Us Anytime
                  </p>
                  <p className="text-sm text-neutral-300">
                    +94 704 222 777
                  </p>
                </div>
              </div>

              <div className="flex gap-x-3">
                <Mail className='text-lg text-blue-400 mt-1 flex-shrink-0' />
                <div className="flex flex-col">
                  <p className="text-sm text-neutral-400">
                    Email Us
                  </p>
                  <p className="text-sm text-neutral-300">
                    info@buszoneplus.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} BusZone+. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  BusZone+
                </div>
                <div className="text-xs text-slate-400">Premium Bus Rentals</div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-blue-400 hover:text-cyan-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Darkened Image */}
      <div className="relative py-0 overflow-hidden">
        <div className="relative h-96 lg:h-screen max-h-[700px] w-full">
          <div className="absolute inset-0 bg-black/70 z-10"></div>
          <img 
            src={aboutImage} 
            alt="About BusZone+" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <div className="mb-4">
              <span className="text-sm font-medium text-cyan-400 tracking-wider">PREMIUM TRANSPORTATION SERVICES</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              About <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">BusZone+</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
              Your trusted partner for luxury bus rentals and premium transportation solutions
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative py-16 lg:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Content Section */}
            <div className="w-full lg:w-1/2">
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">WHO WE ARE</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Excellence in Transportation</h2>
              <div className="space-y-5 text-slate-300">
                <p className="leading-relaxed">
                  BusZone+ (operated by Laksiri Tours) is a well-established transportation service provider specializing in 
                  bus rentals for events, city transfers, and long-distance tours. The company operates from its head office 
                  in Kalutara and has built a strong reputation for reliability and timely service.
                </p>
                <p className="leading-relaxed">
                  Founded over 15 years ago, we began as a small family business with just a few vehicles. 
                  Through dedication to quality service and customer satisfaction, we've grown into one of the most 
                  trusted transportation providers in the region.
                </p>
                <p className="leading-relaxed">
                  Our journey has been guided by a simple philosophy: provide reliable, comfortable, and safe 
                  transportation that exceeds customer expectations. This commitment has allowed us to build 
                  long-term relationships with corporate clients, tour operators, and individual customers alike.
                </p>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm text-center transition-all duration-300 hover:border-blue-400/30 hover:bg-slate-800/70">
                      <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">{stat.number}</div>
                      <div className="text-slate-400 text-sm">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 lg:py-20 bg-slate-850">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 mr-3"></div>
              <span className="text-sm font-medium text-cyan-400">OUR PRINCIPLES</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 ml-3"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">Our Core Values</h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              The principles that guide everything we do and ensure we deliver exceptional service to our clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 group backdrop-blur-sm hover:bg-slate-800/50">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl w-fit mb-5 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors duration-300">{value.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="py-16 lg:py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2">
              <div className="mb-4">
                <span className="text-sm font-medium text-cyan-400">OUR JOURNEY</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-5 text-slate-300">
                <p className="leading-relaxed">
                  Founded over 15 years ago, Laksiri Tours began as a small family business with just a few vehicles. 
                  Through dedication to quality service and customer satisfaction, we've grown into one of the most 
                  trusted transportation providers in the region.
                </p>
                <p className="leading-relaxed">
                  Our journey has been guided by a simple philosophy: provide reliable, comfortable, and safe 
                  transportation that exceeds customer expectations. This commitment has allowed us to build 
                  long-term relationships with corporate clients, tour operators, and individual customers alike.
                </p>
                <p className="leading-relaxed">
                  Today, BusZone+ represents the next chapter in our story - combining our traditional values of 
                  excellent service with modern amenities and a expanding fleet of luxury vehicles.
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl text-center shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
                <Users className="h-10 w-10 text-white mx-auto mb-4" />
                <div className="text-2xl font-bold mb-1">150+</div>
                <div className="text-blue-100 text-sm">Professional Staff</div>
              </div>
              
              <div className="bg-slate-800/50 p-6 rounded-xl text-center border border-slate-700/50 backdrop-blur-sm transform transition-transform duration-300 hover:-translate-y-1">
                <MapPin className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold mb-1">25+</div>
                <div className="text-slate-400 text-sm">Destinations Served</div>
              </div>
              
              <div className="bg-slate-800/50 p-6 rounded-xl text-center border border-slate-700/50 backdrop-blur-sm transform transition-transform duration-300 hover:-translate-y-1">
                <Award className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold mb-1">12</div>
                <div className="text-slate-400 text-sm">Industry Awards</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl text-center shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
                <Shield className="h-10 w-10 text-white mx-auto mb-4" />
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-blue-100 text-sm">Safety Record</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">Ready to Experience Premium Travel?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Contact us today to discuss your transportation needs and get a personalized quote.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl transition-all duration-300 hover:bg-white/15">
              <Phone className="h-5 w-5 text-white" />
              <span className="text-white font-medium">+94 704 222 777</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl transition-all duration-300 hover:bg-white/15">
              <Mail className="h-5 w-5 text-white" />
              <span className="text-white font-medium">info@buszoneplus.com</span>
            </div>
          </div>
          
          <div className="inline-flex items-center px-5 py-2 rounded-xl bg-slate-900/30 border border-slate-700/50 backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-slate-200 text-sm">Head Office: Kalutara, Sri Lanka</span>
          </div>
        </div>
      </div>

      {/* Footer from HomePage */}
      <Footer />
    </div>
  );
};

export default AboutUs;