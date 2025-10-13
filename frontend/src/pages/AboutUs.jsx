import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  CheckCircle,
  Globe,
  Target,
  Zap,
  ChevronRight,
  Play,
  Quote,
  Building2,
  Car,
  Route,
  Headphones,
  Wrench,
  UserCheck,
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import about from "../assets/about.jpg";

const AboutUs = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const aboutImage = about;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Your safety is our top priority. All our vehicles undergo regular maintenance and safety checks.",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50"
    },
    {
      icon: Clock,
      title: "Punctuality",
      description: "We pride ourselves on being on time, every time. Your schedule is important to us.",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "We go the extra mile to ensure your comfort and satisfaction throughout your journey.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards of service quality and professionalism.",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50"
    }
  ];

  const stats = [
    { number: "15+", label: "Years Experience", icon: Calendar, color: "text-blue-600" },
    { number: "150+", label: "Premium Buses", icon: Bus, color: "text-cyan-600" },
    { number: "50,000+", label: "Happy Customers", icon: Users, color: "text-indigo-600" },
    { number: "99.8%", label: "On-Time Record", icon: TrendingUp, color: "text-green-600" }
  ];

  const services = [
    {
      icon: Building2,
      title: "Corporate Transportation",
      description: "Professional business travel solutions for companies of all sizes",
      features: ["Executive Shuttles", "Event Transportation", "Airport Transfers", "Meeting Services"]
    },
    {
      icon: Heart,
      title: "Special Events",
      description: "Make your special occasions memorable with our luxury fleet",
      features: ["Wedding Transportation", "Party Buses", "Anniversary Celebrations", "Custom Decorations"]
    },
    {
      icon: Globe,
      title: "Tourist Services",
      description: "Explore Sri Lanka in comfort with our guided tour packages",
      features: ["City Tours", "Multi-day Trips", "Custom Itineraries", "Professional Guides"]
    },
    {
      icon: Users,
      title: "Group Travel",
      description: "Perfect solutions for large groups and organizations",
      features: ["School Trips", "Religious Pilgrimages", "Sports Teams", "Conference Groups"]
    }
  ];

  const achievements = [
    {
      year: "2008",
      title: "Company Founded",
      description: "Started as a small family business with 3 vehicles",
      icon: Building2
    },
    {
      year: "2012",
      title: "Fleet Expansion",
      description: "Grew to 25 vehicles and established corporate partnerships",
      icon: Car
    },
    {
      year: "2018",
      title: "Digital Transformation",
      description: "Launched online booking system and mobile app",
      icon: Zap
    },
    {
      year: "2023",
      title: "BusZone+ Launch",
      description: "Introduced premium luxury fleet and modern amenities",
      icon: Sparkles
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechCorp",
      text: "BusZone+ has been our trusted transportation partner for over 5 years. Their reliability and professionalism are unmatched.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Event Manager",
      text: "The luxury buses and professional service made our corporate event a huge success. Highly recommended!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Wedding Planner",
      text: "BusZone+ made our destination wedding transportation absolutely flawless. Our guests were genuinely impressed.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face"
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-800">
      {/* Professional Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg py-3"
          : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className={`p-3 rounded-xl shadow-lg transition-all duration-500 ${
                isScrolled 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600" 
                  : "bg-white/20 backdrop-blur-sm"
              }`}>
                <Bus className={`h-8 w-8 transition-colors duration-500 ${
                  isScrolled ? "text-white" : "text-white"
                }`} />
              </div>
              <div>
                <div className={`text-2xl font-bold transition-all duration-500 ${
                  isScrolled 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent" 
                    : "text-white"
                }`}>
                  BusZone+
                </div>
                <div className={`text-xs transition-colors duration-500 ${
                  isScrolled ? "text-blue-600/70" : "text-white/80"
                }`}>
                  Premium Bus Rentals
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 transition-all duration-500 px-4 py-2 rounded-lg ${
                  isScrolled
                    ? "text-blue-600 hover:text-cyan-600 hover:bg-blue-50"
                    : "text-white hover:text-white hover:bg-white/20"
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Professional Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={aboutImage} 
            alt="About BusZone+" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-cyan-900/80"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-cyan-400 text-sm font-semibold rounded-full border border-cyan-400/30">
                  PREMIUM TRANSPORTATION SERVICES
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
                About <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">BusZone+</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Your trusted partner for luxury bus rentals and premium transportation solutions across Sri Lanka
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Watch Our Story</span>
                </button>
                
                <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contact Us</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Professional Stats Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
              OUR ACHIEVEMENTS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Numbers That Speak
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our success is measured by the trust and satisfaction of our customers
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className={`inline-flex p-4 rounded-2xl mb-6 ${stat.color} bg-gradient-to-br from-blue-50 to-cyan-50`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.number}</div>
                    <div className="text-slate-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* About Content Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
                  WHO WE ARE
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8">
                Excellence in Transportation
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  BusZone+ (operated by Laksiri Tours) is a well-established transportation service provider specializing in 
                  bus rentals for events, city transfers, and long-distance tours. The company operates from its head office 
                  in Kalutara and has built a strong reputation for reliability and timely service.
                </p>
                <p>
                  Founded over 15 years ago, we began as a small family business with just a few vehicles. 
                  Through dedication to quality service and customer satisfaction, we've grown into one of the most 
                  trusted transportation providers in the region.
                </p>
                <p>
                  Our journey has been guided by a simple philosophy: provide reliable, comfortable, and safe 
                  transportation that exceeds customer expectations. This commitment has allowed us to build 
                  long-term relationships with corporate clients, tour operators, and individual customers alike.
                </p>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700 font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-slate-700 font-medium">Safety Certified</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-slate-700 font-medium">Award Winning</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-8 rounded-2xl text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
                <p className="text-lg leading-relaxed mb-6">
                  To provide exceptional transportation services that exceed customer expectations while maintaining 
                  the highest standards of safety, reliability, and comfort.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-cyan-300" />
                    <span>Customer-Centric Approach</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-cyan-300" />
                    <span>Safety First Priority</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-cyan-300" />
                    <span>Innovation & Technology</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-cyan-100 text-cyan-600 text-sm font-semibold rounded-full mb-4">
              OUR PRINCIPLES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The principles that guide everything we do and ensure we deliver exceptional service to our clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="group">
                  <div className={`${value.bgColor} p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 group-hover:-translate-y-2 shadow-lg hover:shadow-xl`}>
                    <div className={`bg-gradient-to-r ${value.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
              OUR SERVICES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Comprehensive Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From corporate events to special occasions, we provide tailored transportation solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-2 shadow-lg hover:shadow-xl">
                  <div className="flex items-start space-x-6">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full mb-4">
              OUR JOURNEY
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Story
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From humble beginnings to becoming a trusted transportation leader
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
            
            <div className="space-y-12">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{achievement.year}</div>
                            <h3 className="text-xl font-bold text-slate-800">{achievement.title}</h3>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{achievement.description}</p>
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center z-10 shadow-lg">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    </div>
                    
                    <div className="w-1/2"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-600 text-sm font-semibold rounded-full mb-4">
              TESTIMONIALS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real feedback from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                
                <p className="text-slate-600 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-blue-200"
                  />
                  <div>
                    <div className="font-bold text-slate-800">{testimonial.name}</div>
                    <div className="text-blue-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Ready to Experience Premium Travel?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Contact us today to discuss your transportation needs and get a personalized quote for your next journey.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <button className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 group">
                <Phone className="h-6 w-6 group-hover:animate-bounce" />
                <span>Call +94 704 222 777</span>
              </button>
              
              <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 group">
                <Mail className="h-6 w-6 group-hover:animate-pulse" />
                <span>Email Us</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <Phone className="h-8 w-8 text-cyan-300 mx-auto mb-4" />
                <div className="text-white font-bold text-lg mb-2">Call Us</div>
                <div className="text-blue-100">+94 704 222 777</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <Mail className="h-8 w-8 text-cyan-300 mx-auto mb-4" />
                <div className="text-white font-bold text-lg mb-2">Email Us</div>
                <div className="text-blue-100">info@buszoneplus.com</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <MapPin className="h-8 w-8 text-cyan-300 mx-auto mb-4" />
                <div className="text-white font-bold text-lg mb-2">Visit Us</div>
                <div className="text-blue-100">Kalutara, Sri Lanka</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer from HomePage */}
      <Footer />
    </div>
  );
};

export default AboutUs;