import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Search, 
  Phone, 
  Star,
  Users,
  Shield,
  Clock,
  Smartphone,
  Download,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  Globe,
  Headphones,
  CreditCard,
  Navigation,
  User,
  Settings,
  Mail,
  Heart,
  MapIcon,
  Zap,
  TrendingUp,
  Gift,
  Sparkles,
  Car,
  Plane,
  Train,
  Ship,
  Wifi,
  Coffee,
  Utensils,
  Tv,
  Snowflake,
  Music,
  BatteryCharging,
  Luggage,
  Eye,
  ThumbsUp,
  ShieldCheck,
  Clock4,
  MapPinOff
} from 'lucide-react';

// Import your background images (adjust the paths as needed)
import b1 from "../assets/b1.jpg";
import b2 from "../assets/b2.jpeg";
import b6 from "../assets/b6.jpg";


const AdvancedBusRentalHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // Hero slider images and content
  const heroSlides = [
  {
    title: "Luxury Bus Rentals",
    subtitle: "Premium Comfort for Every Journey",
    description:
      "Experience world-class travel with our luxury fleet equipped with modern amenities",
    cta: "Explore Fleet",
    image: b1, // ✅ use import
    accent: "from-amber-400 to-orange-500",
    icon: <Sparkles className="h-16 w-16 text-amber-300 mb-6 mx-auto" />,
  },
  {
    title: "Corporate Travel Solutions",
    subtitle: "Reliable Business Transportation",
    description:
      "Streamline your corporate events and employee transport with our dedicated services",
    cta: "Get Quote",
    image: b2, // ✅ use import
    accent: "from-emerald-400 to-teal-500",
    icon: <TrendingUp className="h-16 w-16 text-emerald-300 mb-6 mx-auto" />,
  },
  {
    title: "Tourist & Event Charters",
    subtitle: "Memorable Group Adventures",
    description:
      "Perfect for weddings, tours, and special events with customizable packages",
    cta: "Book Now",
    image: b6, // ✅ use import
    accent: "from-rose-400 to-pink-500",
    icon: <Gift className="h-16 w-16 text-rose-300 mb-6 mx-auto" />,
  },
];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Coordinator",
      company: "Premier Events Ltd",
      text: "Absolutely exceptional service! The buses were immaculate and the drivers were professional. Made our corporate event seamless.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Travel Manager",
      company: "GlobalTech Solutions",
      text: "We've been using their services for 2 years. Reliability, comfort, and competitive pricing - everything we need!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Wedding Planner",
      company: "Elegant Occasions",
      text: "They made our destination wedding transportation flawless. Guests were impressed with the luxury buses!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Miles Traveled", icon: Navigation, color: "text-amber-400" },
    { number: "15,459", label: "Happy Customers", icon: Users, color: "text-emerald-400" },
    { number: "150+", label: "Premium Buses", icon: Bus, color: "text-cyan-400" },
    { number: "99.8%", label: "Safety Record", icon: Shield, color: "text-rose-400" }
  ];

  const services = [
    {
      icon: Bus,
      title: "Luxury Coach Rentals",
      description: "Premium buses with reclining seats, WiFi, and entertainment systems",
      features: ["50+ Seater Capacity", "Climate Control", "Entertainment System", "Professional Drivers"],
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-violet-900/20 to-purple-900/20"
    },
    {
      icon: Users,
      title: "Corporate Shuttles",
      description: "Reliable employee transportation and corporate event solutions",
      features: ["Daily Shuttles", "Event Transport", "Airport Transfers", "Flexible Scheduling"],
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-emerald-900/20 to-teal-900/20"
    },
    {
      icon: Heart,
      title: "Special Occasions",
      description: "Wedding, party, and celebration transportation services",
      features: ["Wedding Parties", "Birthday Events", "Anniversary Celebrations", "Custom Decorations"],
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-rose-900/20 to-pink-900/20"
    },
    {
      icon: Globe,
      title: "Tourist Packages",
      description: "Sightseeing tours and multi-day travel packages",
      features: ["City Tours", "Multi-day Trips", "Custom Itineraries", "Tour Guide Services"],
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-900/20 to-orange-900/20"
    }
  ];

  const features = [
    { icon: Wifi, title: "Free WiFi", description: "Stay connected throughout your journey", color: "text-sky-400" },
    { icon: Coffee, title: "Refreshments", description: "Complimentary drinks and snacks", color: "text-amber-400" },
    { icon: Tv, title: "Entertainment", description: "Individual screens with media options", color: "text-purple-400" },
    { icon: Snowflake, title: "AC & Heating", description: "Climate control for your comfort", color: "text-blue-400" },
    { icon: Music, title: "Audio System", description: "Premium sound for music and announcements", color: "text-pink-400" },
    { icon: BatteryCharging, title: "USB Charging", description: "Charge your devices on the go", color: "text-green-400" },
    { icon: Luggage, title: "Storage Space", description: "Ample room for all your luggage", color: "text-yellow-400" },
    { icon: Eye, title: "Privacy Glass", description: "Tinted windows for privacy and comfort", color: "text-indigo-400" }
  ];

  const fleet = [
    {
      name: "Executive Luxury",
      capacity: "20-25 Passengers",
      features: ["Leather Seats", "Onboard Restroom", "4K Entertainment", "Conference Tables"],
      price: "$199/day",
      image: "https://images.unsplash.com/photo-1565738817703-d2c2fec25108?w=500&auto=format&fit=crop&q=60",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Premium Coach",
      capacity: "40-50 Passengers",
      features: ["Reclining Seats", "Overhead Storage", "WiFi Connectivity", "Climate Control"],
      price: "$299/day",
      image: "https://images.unsplash.com/photo-1592260266075-5ad5e97bcf06?w=500&auto=format&fit=crop&q=60",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Mini Party Bus",
      capacity: "15-18 Passengers",
      features: ["LED Lighting", "Sound System", "Bar Setup", "Dance Floor"],
      price: "$349/day",
      image: "https://images.unsplash.com/photo-1592840720206-7a2533c8235b?w=500&auto=format&fit=crop&q=60",
      color: "from-amber-500 to-red-500"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight && rect.bottom >= 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Advanced Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-xl shadow-lg animate-pulse">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  BusZone+
                </div>
                <div className="text-xs text-slate-400">Premium Bus Rentals</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                { name: 'Home', active: true },
                { name: 'Fleet', active: false },
                { name: 'Services', active: false },
                { name: 'Corporate', active: false },
                { name: 'About', active: false },
                { name: 'Contact', active: false }
              ].map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                    item.active 
                      ? 'text-amber-400' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full ${item.active ? 'w-full' : ''}`}></span>
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-slate-300 group">
                <div className="relative">
                  <Phone className="h-4 w-4 text-amber-400 group-hover:animate-bounce" />
                  <div className="absolute -top-1 -right-1 bg-amber-400 w-2 h-2 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm group-hover:text-amber-400 transition-colors">+94 704 222 777</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 relative overflow-hidden group">
                  <span className="relative z-10">Get Quote</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 animate-fade-in">
              <div className="px-6 py-6 space-y-4">
                {['Home', 'Fleet', 'Services', 'Corporate', 'About', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className=" text-slate-300 hover:text-amber-400 py-2 text-lg font-medium transition-colors duration-300 flex items-center"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                ))}
                <div className="pt-6 border-t border-slate-700 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="h-4 w-4 text-amber-400" />
                    <span>+94 704 222 777</span>
                  </div>
                  <button
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Login
                  </button>
                  <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                    Get Quote
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Slider Section */}
      <div className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Background image with overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            ></div>
            <div className="absolute inset-0 bg-black/60"></div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-bounce"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                  {slide.icon}
                  
                  <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${slide.accent} mb-6 animate-fade-in-up shadow-lg`}>
                    <span className="text-white font-semibold text-sm">Premium Transportation Solutions</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-in-up delay-200">
                    {slide.title}
                  </h1>
                  
                  <p className={`text-2xl md:text-3xl font-semibold bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent mb-8 animate-fade-in-up delay-300`}>
                    {slide.subtitle}
                  </p>
                  
                  <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto animate-fade-in-up delay-400">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-500">
                    <button className={`bg-gradient-to-r ${slide.accent} hover:shadow-2xl text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg relative overflow-hidden group`}>
                      <span className="relative z-10">{slide.cta}</span>
                      <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    </button>
                    
                    <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-10 py-4 rounded-2xl font-semibold border border-white/30 transition-all duration-300 flex items-center space-x-3 group">
                      <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Watch Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-amber-500/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 group"
        >
          <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-amber-500/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 group"
        >
          <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-12 h-2 rounded-full transition-all duration-300 relative overflow-hidden group ${
                index === currentSlide ? 'bg-amber-400' : 'bg-white/30'
              }`}
            >
              {index === currentSlide && (
                <span className="absolute top-0 left-0 h-full bg-amber-200 animate-progress"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-20" ref={sectionRef}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`text-center group transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className={`${stat.color} bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                    <Icon className="h-12 w-12 mx-auto" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 animate-count-up">{stat.number}</div>
                  <div className="text-slate-400 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/30 mb-6">
              <span className="text-amber-400 font-semibold">Premium Amenities</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Luxury Travel Experience</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">Enjoy a comfortable journey with our state-of-the-art amenities and services</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700/50 hover:border-amber-400/50 transition-all duration-500 hover:transform hover:scale-105 group text-center">
                  <div className={`${feature.color} p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/30 mb-6">
              <span className="text-amber-400 font-semibold">Our Services</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Premium Transportation Solutions</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">Experience luxury, reliability, and comfort with our comprehensive range of bus rental services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className={`group ${service.bgColor} p-8 rounded-3xl border border-slate-700/50 hover:border-amber-400/50 transition-all duration-500 hover:transform hover:scale-105 relative overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className={`bg-gradient-to-r ${service.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300 relative z-10">{service.title}</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed relative z-10">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="text-amber-400 hover:text-white font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-all duration-300 relative z-10">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fleet Section */}
      <div className="bg-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/30 mb-6">
              <span className="text-amber-400 font-semibold">Our Fleet</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">Luxury Vehicles</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">Choose from our premium selection of buses for any occasion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fleet.map((vehicle, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden border border-slate-700/50 hover:border-amber-400/50 transition-all duration-500 group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${vehicle.color} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                    {vehicle.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{vehicle.name}</h3>
                  <p className="text-slate-400 mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-amber-400" />
                    {vehicle.capacity}
                  </p>
                  
                  <div className="mb-6">
                    {vehicle.features.map((feature, i) => (
                      <div key={i} className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Slider */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
            <p className="text-slate-400 text-lg">Trusted by thousands of satisfied customers</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-in-out ${
                  index === currentTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-xl text-slate-300 mb-8 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 border-2 border-amber-400"
                    />
                    <div>
                      <div className="font-bold text-white text-lg">{testimonial.name}</div>
                      <div className="text-amber-400 font-medium">{testimonial.role}</div>
                      <div className="text-slate-400 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Travel in Style?</h2>
            <p className="text-xl text-amber-100 mb-8">Get an instant quote and book your premium bus rental today</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white hover:bg-gray-100 text-amber-600 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 group">
                <Phone className="h-5 w-5 group-hover:animate-bounce" />
                <span>Call Now</span>
              </button>
              
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 group">
                <Mail className="h-5 w-5 group-hover:animate-pulse" />
                <span>Get Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-progress {
          animation: progress 6s linear forwards;
        }
        
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
      `}</style>
    </div>
  );
};

export default AdvancedBusRentalHomepage;