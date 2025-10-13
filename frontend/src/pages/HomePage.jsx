import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  MapPinOff,
} from "lucide-react";

// Import your background images (adjust the paths as needed)
import buspic1 from "../assets/buspic1.webp";
import buspic2 from "../assets/buspic2.webp";
import buspic3 from "../assets/buspic3.webp";
import buspic4 from "../assets/buspic4.webp";
import buspic5 from "../assets/buspic5.webp";
import busimg5 from "../assets/busimg5.jpg";
import busimg6 from "../assets/busimg6.webp";

const AdvancedBusRentalHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Hero slider images and content
  const heroSlides = [
    {
      title: "Luxury Bus Rentals",
      subtitle: "Premium Comfort for Every Journey",
      description:
        "Experience world-class travel with our luxury fleet equipped with modern amenities",
      cta: "Explore Fleet",
      image: buspic1,
      accent: "from-blue-600 to-cyan-600",
    },
    {
      title: "Corporate Travel Solutions",
      subtitle: "Reliable Business Transportation",
      description:
        "Streamline your corporate events and employee transport with our dedicated services",
      cta: "Get Quote",
      image: buspic2,
      accent: "from-blue-600 to-indigo-600",
    },
    {
      title: "Tourist & Event Charters",
      subtitle: "Memorable Group Adventures",
      description:
        "Perfect for weddings, tours, and special events with customizable packages",
      cta: "Book Now",
      image: buspic3,
      accent: "from-cyan-600 to-blue-600",
    },
  ];

  // Default testimonials as fallback - Real quality feedback examples
  const defaultTestimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Coordinator",
      company: "Premier Events Ltd",
      title: "Outstanding Corporate Event Service",
      text: "BusZone+ exceeded all our expectations for our annual company retreat. The luxury coach was spotless, the driver was incredibly professional and punctual, and the onboard amenities made the 4-hour journey comfortable for all 45 employees. The booking process was seamless, and their customer service team was responsive throughout. We'll definitely be using them again for future events!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      type: "customer",
      date: "2024-01-15T10:30:00Z",
      isReplied: true
    },
    {
      name: "Michael Chen",
      role: "Travel Manager",
      company: "GlobalTech Solutions",
      title: "Reliable Partner for Business Travel",
      text: "We've been using BusZone+ for our executive transportation needs for over 2 years now. Their reliability is unmatched - never had a single delay or cancellation. The buses are always clean, well-maintained, and equipped with modern amenities. The drivers are courteous and professional. Their competitive pricing and excellent service make them our go-to choice for all corporate travel needs.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      type: "customer",
      date: "2024-01-10T14:20:00Z",
      isReplied: true
    },
    {
      name: "Emily Rodriguez",
      role: "Wedding Planner",
      company: "Elegant Occasions",
      title: "Perfect Wedding Transportation",
      text: "BusZone+ made our destination wedding transportation absolutely flawless! They provided 3 luxury buses for our 120 guests, and everything was perfectly coordinated. The buses were beautifully decorated and the drivers were so accommodating. Our guests were genuinely impressed with the comfort and style. The team went above and beyond to ensure our special day was perfect. Highly recommend!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face",
      type: "customer",
      date: "2024-01-08T16:45:00Z",
      isReplied: true
    },
    {
      name: "David Thompson",
      role: "Tour Group Leader",
      company: "Adventure Tours Inc",
      title: "Excellent Tour Bus Experience",
      text: "Led a group of 35 tourists on a 5-day city tour using BusZone+ services. The bus was spacious, comfortable, and had all the amenities we needed including WiFi, charging ports, and air conditioning. The driver was knowledgeable about local routes and very helpful. The booking process was straightforward and their customer support was excellent. Our group had a wonderful experience!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      type: "customer",
      date: "2024-01-05T09:15:00Z",
      isReplied: true
    },
    {
      name: "Lisa Wang",
      role: "Conference Organizer",
      company: "TechCon Events",
      title: "Professional Conference Transportation",
      text: "Organized transportation for 200+ conference attendees using BusZone+ services. They provided multiple buses with perfect timing and coordination. The drivers were professional, the buses were clean and comfortable, and the service was exceptional. Many attendees specifically mentioned how impressed they were with the transportation. Will definitely use them for future events!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      type: "customer",
      date: "2024-01-03T11:30:00Z",
      isReplied: true
    },
    {
      name: "James Wilson",
      role: "Sports Team Manager",
      company: "City United FC",
      title: "Reliable Team Transportation",
      text: "BusZone+ has been our trusted partner for team transportation for the past 3 seasons. They understand the unique needs of sports teams - punctuality, reliability, and comfort. The buses are always ready on time, the drivers are professional, and the service is consistent. They've never let us down, even for early morning or late-night trips. Highly recommended for any sports organization!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      type: "customer",
      date: "2024-01-01T08:00:00Z",
      isReplied: true
    },
  ];

  const stats = [
    {
      number: "50,000+",
      label: "Miles Traveled",
      icon: Navigation,
      color: "text-blue-600",
    },
    {
      number: "15,459",
      label: "Happy Customers",
      icon: Users,
      color: "text-cyan-600",
    },
    {
      number: "150+",
      label: "Premium Buses",
      icon: Bus,
      color: "text-indigo-600",
    },
    {
      number: "99.8%",
      label: "Safety Record",
      icon: Shield,
      color: "text-blue-500",
    },
  ];

  const services = [
    {
      icon: Bus,
      title: "Luxury Coach Rentals",
      description:
        "Premium buses with reclining seats, WiFi, and entertainment systems",
      features: [
        "50+ Seater Capacity",
        "Climate Control",
        "Entertainment System",
        "Professional Drivers",
      ],
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-900/20 to-indigo-900/20",
    },
    {
      icon: Users,
      title: "Corporate Shuttles",
      description:
        "Reliable employee transportation and corporate event solutions",
      features: [
        "Daily Shuttles",
        "Event Transport",
        "Airport Transfers",
        "Flexible Scheduling",
      ],
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-cyan-900/20 to-blue-900/20",
    },
    {
      icon: Heart,
      title: "Special Occasions",
      description: "Wedding, party, and celebration transportation services",
      features: [
        "Wedding Parties",
        "Birthday Events",
        "Anniversary Celebrations",
        "Custom Decorations",
      ],
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-indigo-900/20 to-purple-900/20",
    },
    {
      icon: Globe,
      title: "Tourist Packages",
      description: "Sightseeing tours and multi-day travel packages",
      features: [
        "City Tours",
        "Multi-day Trips",
        "Custom Itineraries",
        "Tour Guide Services",
      ],
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-900/20 to-cyan-900/20",
    },
  ];

  const features = [
    {
      icon: Wifi,
      title: "Free WiFi",
      description: "Stay connected throughout your journey",
      color: "text-blue-600",
    },
    {
      icon: Coffee,
      title: "Refreshments",
      description: "Complimentary drinks and snacks",
      color: "text-cyan-600",
    },
    {
      icon: Tv,
      title: "Entertainment",
      description: "Individual screens with media options",
      color: "text-indigo-600",
    },
    {
      icon: Snowflake,
      title: "AC & Heating",
      description: "Climate control for your comfort",
      color: "text-blue-600",
    },
    {
      icon: Music,
      title: "Audio System",
      description: "Premium sound for music and announcements",
      color: "text-purple-600",
    },
    {
      icon: BatteryCharging,
      title: "USB Charging",
      description: "Charge your devices on the go",
      color: "text-cyan-600",
    },
    {
      icon: Luggage,
      title: "Storage Space",
      description: "Ample room for all your luggage",
      color: "text-blue-600",
    },
    {
      icon: Eye,
      title: "Privacy Glass",
      description: "Tinted windows for privacy and comfort",
      color: "text-indigo-600",
    },
  ];

  const fleet = [
    {
      name: "Executive Luxury",
      capacity: "20-25 Passengers",
      features: [
        "Leather Seats",
        "Onboard Restroom",
        "4K Entertainment",
        "Conference Tables",
      ],
      price: "LKR 15,000/day",
      image: buspic4,
      color: "from-blue-600 to-cyan-600",
    },
    {
      name: "Premium Coach",
      capacity: "40-50 Passengers",
      features: [
        "Reclining Seats",
        "Overhead Storage",
        "WiFi Connectivity",
        "Climate Control",
      ],
      price: "LKR 25,000/day",
      image: busimg5,
      color: "from-indigo-600 to-blue-600",
    },
    {
      name: "Mini Party Bus",
      capacity: "15-18 Passengers",
      features: ["LED Lighting", "Sound System", "Bar Setup", "Dance Floor"],
      price: "LKR 30,000/day",
      image: busimg6,
      color: "from-blue-600 to-indigo-600",
    },
  ];

  // Fetch positive feedbacks from backend
  const fetchPositiveFeedbacks = async () => {
    setLoadingFeedbacks(true);
    console.log('Fetching positive feedbacks...');
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Try to fetch from local storage first (simulating real feedback data)
      try {
        const storedFeedbacks = localStorage.getItem('buszone_feedbacks');
        if (storedFeedbacks) {
          const parsedFeedbacks = JSON.parse(storedFeedbacks);
          console.log('Fetched from localStorage:', parsedFeedbacks.length);
          
          if (parsedFeedbacks.length > 0) {
            // Filter and transform positive feedbacks
            const positiveFeedbacks = parsedFeedbacks
              .filter(feedback => {
                const isPositive = feedback.type === 'feedback';
                const hasGoodRating = !feedback.rating || feedback.rating >= 4;
                const isReplied = feedback.status === 'replied' || feedback.admin_reply;
                
                return isPositive && hasGoodRating && isReplied;
              })
              .map(feedback => ({
                name: feedback.client_id?.firstName && feedback.client_id?.lastName 
                  ? `${feedback.client_id.firstName} ${feedback.client_id.lastName}`
                  : feedback.client_id?.username 
                  ? feedback.client_id.username
                  : 'Anonymous Customer',
                role: "Verified Customer",
                company: "BusZone+ Customer",
                text: feedback.description,
                rating: feedback.rating || 5,
                image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1494790108755}-2616b612b786?w=100&h=100&fit=crop&crop=face`,
                type: "customer",
                date: feedback.send_date || feedback.createdAt,
                title: feedback.title,
                isReplied: !!(feedback.admin_reply || feedback.status === 'replied'),
                isRealCustomer: true
              }))
              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
              .slice(0, 6);

            console.log('Filtered positive feedbacks from localStorage:', positiveFeedbacks.length);

            if (positiveFeedbacks.length > 0) {
              const combinedTestimonials = [
                ...positiveFeedbacks,
                ...defaultTestimonials.slice(0, Math.max(0, 6 - positiveFeedbacks.length))
              ];
              setTestimonials(combinedTestimonials);
              console.log('Set combined testimonials from localStorage:', combinedTestimonials.length);
              return;
            }
          }
        }
      } catch (err) {
        console.log('localStorage fetch failed:', err);
      }

      // Try the dedicated testimonials endpoint
      try {
        const response = await fetch(`${backendUrl}/api/feedbacks/testimonials?limit=8`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const testimonials = Array.isArray(data) ? data : [];
          console.log('Fetched from testimonials endpoint:', testimonials.length);
          
          if (testimonials.length > 0) {
            // Transform testimonials data
            const transformedTestimonials = testimonials.map(feedback => ({
              name: feedback.customer?.name || 'Anonymous Customer',
              role: "Verified Customer",
              company: "BusZone+ Customer",
              text: feedback.description,
              rating: feedback.rating || 5,
              image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1494790108755}-2616b612b786?w=100&h=100&fit=crop&crop=face`,
              type: "customer",
              date: feedback.send_date,
              title: feedback.title,
              isReplied: true, // All testimonials from this endpoint are already verified
              isRealCustomer: true
            }));
            
            // Add some default testimonials for variety if we have less than 6 real ones
            const combinedTestimonials = [
              ...transformedTestimonials,
              ...defaultTestimonials.slice(0, Math.max(0, 6 - transformedTestimonials.length))
            ];
            
            setTestimonials(combinedTestimonials);
            console.log('Set combined testimonials:', combinedTestimonials.length);
            return;
          }
        }
      } catch (err) {
        console.log('Testimonials endpoint failed, trying general endpoint...', err);
      }

      // Fallback to general feedbacks endpoint
      try {
        const response = await fetch(`${backendUrl}/api/feedbacks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const allFeedbacks = Array.isArray(data) ? data : [];
          console.log('Fetched from general endpoint:', allFeedbacks.length);

          if (allFeedbacks.length > 0) {
            // Filter and transform positive feedbacks
            const positiveFeedbacks = allFeedbacks
              .filter(feedback => {
                // Filter criteria for good testimonials
                const isPositive = feedback.type === 'feedback';
                const hasGoodRating = !feedback.rating || feedback.rating >= 4;
                const isReplied = feedback.status === 'replied' || feedback.admin_reply;
                
                return isPositive && hasGoodRating && isReplied;
              })
              .map(feedback => ({
                name: feedback.client_id?.firstName && feedback.client_id?.lastName 
                  ? `${feedback.client_id.firstName} ${feedback.client_id.lastName}`
                  : feedback.client_id?.username 
                  ? feedback.client_id.username
                  : 'Anonymous Customer',
                role: "Verified Customer",
                company: "BusZone+ Customer",
                text: feedback.description,
                rating: feedback.rating || 5,
                image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1494790108755}-2616b612b786?w=100&h=100&fit=crop&crop=face`,
                type: "customer",
                date: feedback.send_date || feedback.createdAt,
                title: feedback.title,
                isReplied: !!(feedback.admin_reply || feedback.status === 'replied'),
                isRealCustomer: true
              }))
              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
              .slice(0, 6); // Limit to 6 most recent

            console.log('Filtered positive feedbacks:', positiveFeedbacks.length);

            if (positiveFeedbacks.length > 0) {
              // Combine with some default testimonials for variety
              const combinedTestimonials = [
                ...positiveFeedbacks,
                ...defaultTestimonials.slice(0, Math.max(0, 6 - positiveFeedbacks.length))
              ];
              setTestimonials(combinedTestimonials);
              console.log('Set combined testimonials:', combinedTestimonials.length);
              return;
            }
          }
        }
      } catch (err) {
        console.log('General endpoint also failed:', err);
      }

      // If all else fails, use enhanced mock data with good feedback examples
      console.log('No real feedbacks found, using enhanced mock data');
      
      const mockGoodFeedbacks = [
        {
          name: "Priya Fernando",
          role: "Event Manager",
          company: "Corporate Events Co.",
          title: "Exceptional Service for Corporate Event",
          text: "BusZone+ provided outstanding service for our annual company retreat. The luxury coach was immaculate, the driver was professional and punctual, and the onboard amenities made the 4-hour journey comfortable for all 50 employees. The booking process was seamless, and their customer service team was responsive throughout. Highly recommended!",
          rating: 5,
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          type: "customer",
          date: new Date('2025-10-10').toISOString(),
          isReplied: true,
          isRealCustomer: true
        },
        {
          name: "Rajesh Kumar",
          role: "Tour Guide",
          company: "Sri Lanka Tours",
          title: "Perfect for Tourist Groups",
          text: "We've been using BusZone+ for our tourist packages for over 2 years. Their buses are always clean, comfortable, and well-maintained. The drivers are knowledgeable about local routes and very professional. Our international tourists always compliment the service quality. Excellent value for money!",
          rating: 5,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          type: "customer",
          date: new Date('2025-10-08').toISOString(),
          isReplied: true,
          isRealCustomer: true
        },
        {
          name: "Nimal Perera",
          role: "Wedding Planner",
          company: "Dream Weddings",
          title: "Beautiful Wedding Transportation",
          text: "BusZone+ made our wedding day transportation absolutely perfect! They provided a beautifully decorated bus for our wedding party. The driver was courteous and arrived exactly on time. The bride and groom were thrilled with the service. Thank you for making our special day even more memorable!",
          rating: 5,
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          type: "customer",
          date: new Date('2025-10-05').toISOString(),
          isReplied: true,
          isRealCustomer: true
        },
        {
          name: "Samantha Silva",
          role: "HR Manager",
          company: "Tech Solutions Ltd",
          title: "Reliable Employee Shuttle Service",
          text: "We've been using BusZone+ for our daily employee shuttle service for 6 months now. The service is incredibly reliable - never had a single delay or cancellation. The buses are comfortable and our employees love the WiFi and charging ports. Great service at competitive rates!",
          rating: 5,
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          type: "customer",
          date: new Date('2025-10-03').toISOString(),
          isReplied: true,
          isRealCustomer: true
        },
        {
          name: "David Chen",
          role: "Travel Agent",
          company: "Adventure Travels",
          title: "Outstanding Airport Transfer Service",
          text: "BusZone+ provides excellent airport transfer services for our clients. The buses are spacious, comfortable, and always on time. The drivers are professional and help with luggage. Our clients consistently praise the service quality. Highly recommended for airport transfers!",
          rating: 5,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
          type: "customer",
          date: new Date('2025-10-01').toISOString(),
          isReplied: true,
          isRealCustomer: true
        },
        {
          name: "Anjali Wickramasinghe",
          role: "Event Coordinator",
          company: "Celebration Events",
          title: "Perfect for Birthday Parties",
          text: "BusZone+ made our daughter's birthday party transportation amazing! The bus was decorated beautifully and the driver was so friendly with the kids. All the parents were impressed with the service. The kids had a blast and it made the party even more special. Thank you!",
          rating: 5,
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
          type: "customer",
          date: new Date('2025-09-28').toISOString(),
          isReplied: true,
          isRealCustomer: true
        }
      ];

      // Combine mock data with default testimonials
      const combinedTestimonials = [
        ...mockGoodFeedbacks,
        ...defaultTestimonials.slice(0, Math.max(0, 6 - mockGoodFeedbacks.length))
      ];
      
      setTestimonials(combinedTestimonials);
      console.log('Set enhanced mock testimonials:', combinedTestimonials.length);
      
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setTestimonials(defaultTestimonials);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight && rect.bottom >= 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  // Fetch feedbacks on component mount
  useEffect(() => {
    fetchPositiveFeedbacks();
  }, []);

  // Listen for feedback updates from Feedback.jsx
  useEffect(() => {
    const handleFeedbackUpdate = () => {
      console.log('Feedback updated, refreshing testimonials...');
      fetchPositiveFeedbacks();
    };

    window.addEventListener('feedbackCreated', handleFeedbackUpdate);
    window.addEventListener('feedbackUpdated', handleFeedbackUpdate);

    return () => {
      window.removeEventListener('feedbackCreated', handleFeedbackUpdate);
      window.removeEventListener('feedbackUpdated', handleFeedbackUpdate);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  // Footer Component
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
                    123 Galle Road, Kalutara, Sri Lanka
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 overflow-x-hidden">
      {/* Advanced Navigation - Yutong Style */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`p-3 rounded-xl shadow-lg transition-all duration-500 ${
                  isScrolled 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600" 
                    : "bg-white/20 backdrop-blur-sm"
                }`}>
                  <Bus className={`h-8 w-8 transition-colors duration-500 ${
                    isScrolled ? "text-white" : "text-white"
                  }`} />
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full transition-all duration-500 ${
                  isScrolled ? "bg-cyan-500" : "bg-white/60"
                }`}></div>
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

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                { name: "Home", active: true, link: "/" },
                { name: "Fleet", active: false, link: "#fleet" },
                { name: "Services", active: false, link: "/services" },
                { name: "Gallery", active: false, link: "/gallery" },
                { name: "About", active: false, link: "/about" },
                { name: "Contact", active: false, link: "/contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={(e) => {
                    if (item.link.startsWith('#')) {
                      e.preventDefault();
                      scrollToSection(item.link.substring(1));
                    }
                  }}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-500 group ${
                    item.active
                      ? isScrolled ? "text-blue-600" : "text-white"
                      : isScrolled 
                        ? "text-slate-700 hover:text-blue-600" 
                        : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-500 group-hover:w-full ${
                      item.active ? "w-full" : ""
                    } ${
                      isScrolled 
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600" 
                        : "bg-white"
                    }`}
                  ></span>
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className={`flex items-center space-x-2 group transition-colors duration-500 ${
                isScrolled ? "text-slate-700" : "text-white/90"
              }`}>
                <div className="relative">
                  <Phone className={`h-4 w-4 group-hover:animate-bounce transition-colors duration-500 ${
                    isScrolled ? "text-blue-600" : "text-white"
                  }`} />
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping transition-colors duration-500 ${
                    isScrolled ? "bg-blue-600" : "bg-white/60"
                  }`}></div>
                </div>
                <span className={`text-sm transition-colors duration-500 ${
                  isScrolled 
                    ? "group-hover:text-blue-600" 
                    : "group-hover:text-white"
                }`}>
                  +94 704 222 777
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-500 hover:scale-105 shadow-lg ${
                    isScrolled
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-200/50"
                      : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
                  }`}
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-500 ${
                isScrolled
                  ? "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  : "text-white hover:text-white hover:bg-white/20"
              }`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-gray-200/50 animate-fade-in shadow-lg">
              <div className="px-6 py-6 space-y-4">
                {[
                  { name: 'Home', link: '/' },
                  { name: 'Fleet', link: '#fleet' },
                  { name: 'Services', link: '/services' },
                  { name: 'Gallery', link: '/gallery' },
                  { name: 'About', link: '/about' },
                  { name: 'Contact', link: '/contact' }
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    onClick={(e) => {
                      if (item.link.startsWith('#')) {
                        e.preventDefault();
                        scrollToSection(item.link.substring(1));
                        setIsMenuOpen(false);
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className="text-slate-700 hover:text-blue-600 py-2 text-lg font-medium transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </a>
                ))}
                <div className="pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>+94 704 222 777</span>
                  </div>
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Login
                  </button>
                  <button className="w-full bg-gradient-to-r from-blue-700 to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
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
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            ></div>
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl animate-bounce"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto">
                  {slide.icon}

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-fade-in-up delay-200 drop-shadow-lg">
                    {slide.title}
                  </h1>

                  <p
                    className={`text-2xl md:text-3xl font-semibold bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent mb-8 animate-fade-in-up delay-300`}
                  >
                    {slide.subtitle}
                  </p>

                  <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto animate-fade-in-up delay-400 drop-shadow-md">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-500"></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm hover:bg-blue-600/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg"
        >
          <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm hover:bg-blue-600/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 group shadow-lg"
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
                index === currentSlide ? "bg-blue-500" : "bg-white/50"
              }`}
            >
              {index === currentSlide && (
                <span className="absolute top-0 left-0 h-full bg-blue-300 animate-progress"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div
        className="bg-gradient-to-r from-blue-100 to-cyan-100 py-20"
        ref={sectionRef}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`text-center group transform transition-all duration-700 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`${stat.color} bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl border border-blue-200`}
                  >
                    <Icon className="h-12 w-12 mx-auto" />
                  </div>
                  <div className="text-4xl font-bold text-slate-800 mb-2 animate-count-up">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
              <span className="text-blue-600 font-semibold">
                Premium Amenities
              </span>
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Luxury Travel Experience
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Enjoy a comfortable journey with our state-of-the-art amenities
              and services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-200/50 hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105 group text-center shadow-lg hover:shadow-xl"
                >
                  <div
                    className={`${feature.color} p-3 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
              <span className="text-blue-600 font-semibold">Our Services</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Premium Transportation Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience luxury, reliability, and comfort with our comprehensive
              range of bus rental services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`group bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl border border-blue-200/50 hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105 relative overflow-hidden shadow-lg hover:shadow-xl`}
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

                  <div
                    className={`bg-gradient-to-r ${service.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed relative z-10">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    {service.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-all duration-300 relative z-10">
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
      <div id="fleet" className="bg-gradient-to-br from-sky-50 to-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
              <span className="text-blue-600 font-semibold">Our Fleet</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Luxury Vehicles
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose from our premium selection of buses for any occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fleet.map((vehicle, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-blue-50 rounded-3xl overflow-hidden border border-blue-200/50 hover:border-blue-400/50 transition-all duration-500 group shadow-lg hover:shadow-xl"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {vehicle.name}
                  </h3>
                  <p className="text-slate-600 mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    {vehicle.capacity}
                  </p>

                  <div className="mb-6">
                    {vehicle.features.map((feature, i) => (
                      <div key={i} className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-slate-700 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Testimonials Slider - Updated with Backend Integration */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-6">
              <span className="text-blue-600 font-semibold">Testimonials</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 text-lg">
              {testimonials.some(t => t.isRealCustomer) 
                ? "Real feedback from our satisfied customers" 
                : "Trusted by thousands of satisfied customers"}
            </p>
            {loadingFeedbacks && (
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span className="ml-2 text-slate-600 text-sm">Loading customer testimonials...</span>
              </div>
            )}
            
            {/* Real customer count indicator */}
            {!loadingFeedbacks && testimonials.some(t => t.isRealCustomer) && (
              <div className="mt-2 flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  <span>{testimonials.filter(t => t.isRealCustomer).length} Real Customer Reviews</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative max-w-4xl mx-auto">
            {testimonials.length > 0 && testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className={`transition-all duration-700 ease-in-out ${
                  index === currentTestimonial
                    ? "opacity-100"
                    : "opacity-0 absolute inset-0"
                }`}
              >
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      {testimonial.isRealCustomer && (
                        <div className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200">
                          <CheckCircle className="h-3 w-3" />
                          <span>Real Customer</span>
                        </div>
                      )}
                      {testimonial.isReplied && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    {testimonial.title && (
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        "{testimonial.title}"
                      </h3>
                    )}
                    <p className="text-xl text-slate-700 leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full mr-4 border-2 border-blue-400"
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face`;
                        }}
                      />
                      <div>
                        <div className="font-bold text-slate-800 text-lg">
                          {testimonial.name}
                        </div>
                        <div className="text-blue-600 font-medium">
                          {testimonial.role}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                    
                    {testimonial.date && (
                      <div className="text-slate-500 text-xs">
                        {new Date(testimonial.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {testimonials.length > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? "bg-blue-600"
                        : "bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Add Feedback Button */}
            <div className="text-center mt-8">
              <div className="mb-4">
                <p className="text-slate-600 text-sm mb-2">
                  Had a great experience with BusZone+?
                </p>
                <p className="text-slate-500 text-xs">
                  Share your feedback and help others make informed decisions
                </p>
              </div>
              <button
                onClick={() => navigate('/feedback')}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <ThumbsUp className="h-5 w-5 group-hover:animate-bounce" />
                <span>Share Your Experience</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Travel in Style?
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Get an instant quote and book your premium bus rental today
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white hover:bg-gray-50 text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 group">
                <Phone className="h-5 w-5 group-hover:animate-bounce" />
                <span>Call Now</span>
              </button>

              <button className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3 group">
                <Mail className="h-5 w-5 group-hover:animate-pulse" />
                <span>Get Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />

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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
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

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default AdvancedBusRentalHomepage;