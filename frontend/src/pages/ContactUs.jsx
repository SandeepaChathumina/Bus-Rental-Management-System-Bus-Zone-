import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  ArrowLeft,
  MessageCircle,
  User,
  Map,
  Bus,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
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
  Sparkles,
  Shield,
  Award,
  Star,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import aboutImage from "../assets/contactus.jpg";

const ContactUs = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us anytime for immediate assistance",
      contact: "+94 704 222 777",
      availability: "24/7 Support",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond quickly",
      contact: "info@buszoneplus.com",
      availability: "Response within 24 hours",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      icon: MapPin,
      title: "Visit Our Office",
      description: "Come and meet us in person",
      contact: "123 Galle Road, Kalutara",
      availability: "Mon-Fri: 8AM-8PM",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50"
    },
    {
      icon: Headphones,
      title: "Live Chat",
      description: "Chat with our support team online",
      contact: "Available on website",
      availability: "Mon-Fri: 9AM-6PM",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50"
    }
  ];

  const faqs = [
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 48 hours in advance for standard services, and 1 week for special events or peak seasons."
    },
    {
      question: "What is included in the rental price?",
      answer: "Our rental price includes the vehicle, professional driver, fuel, and basic amenities. Additional services may have extra charges."
    },
    {
      question: "Do you provide insurance coverage?",
      answer: "Yes, all our vehicles are fully insured and our drivers are licensed and experienced professionals."
    },
    {
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify your booking up to 24 hours before the scheduled time. Please contact us for assistance."
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
            alt="Contact BusZone+" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-cyan-900/80"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-cyan-400 text-sm font-semibold rounded-full border border-cyan-400/30">
                  GET IN TOUCH
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
                Contact <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Us</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Get in touch with us for any inquiries, quotes, or assistance. Our team is ready to help you with your transportation needs.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Call Now</span>
                </button>
                
                <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Send Email</span>
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

      {/* Contact Methods Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
              CONTACT METHODS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              How to Reach Us
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the most convenient way to get in touch with our team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="group">
                  <div className={`${method.bgColor} p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 group-hover:-translate-y-2 shadow-lg hover:shadow-xl`}>
                    <div className={`bg-gradient-to-r ${method.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                      {method.title}
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {method.description}
                    </p>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-slate-800">{method.contact}</div>
                      <div className="text-sm text-slate-500">{method.availability}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-cyan-100 text-cyan-600 text-sm font-semibold rounded-full">
                  GET IN TOUCH
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8">
                Let's Start a Conversation
              </h2>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                Have questions about our services? Need a custom quote? Our team is here to help you with all your transportation needs.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl shadow-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">Phone</h3>
                    <p className="text-slate-600 text-lg">+94 704 222 777</p>
                    <p className="text-slate-500">Mon-Sun, 24/7 support</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-2xl shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">Email</h3>
                    <p className="text-slate-600 text-lg">info@buszoneplus.com</p>
                    <p className="text-slate-500">We respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">Address</h3>
                    <p className="text-slate-600 text-lg">123 Galle Road, Kalutara</p>
                    <p className="text-slate-600">Western Province, Sri Lanka</p>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-white hover:bg-blue-500 p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg border border-gray-200 hover:border-blue-500 group">
                    <Facebook className="h-6 w-6 text-blue-600 group-hover:text-white" />
                  </a>
                  <a href="#" className="bg-white hover:bg-pink-500 p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg border border-gray-200 hover:border-pink-500 group">
                    <Instagram className="h-6 w-6 text-pink-600 group-hover:text-white" />
                  </a>
                  <a href="#" className="bg-white hover:bg-blue-400 p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg border border-gray-200 hover:border-blue-400 group">
                    <Twitter className="h-6 w-6 text-blue-500 group-hover:text-white" />
                  </a>
                  <a href="#" className="bg-white hover:bg-blue-600 p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg border border-gray-200 hover:border-blue-600 group">
                    <Linkedin className="h-6 w-6 text-blue-700 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-slate-800">Send Us a Message</h2>
                <p className="text-slate-600 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 p-4 transition-all duration-300"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                      Your Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 p-4 transition-all duration-300"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-3">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MessageCircle className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 p-4 transition-all duration-300"
                        placeholder="What is this about?"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-3">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-4 transition-all duration-300 resize-none"
                      placeholder="Please describe your requirements in detail..."
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-600 text-sm font-semibold rounded-full mb-4">
              FREQUENTLY ASKED
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Common Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Find answers to the most frequently asked questions about our services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-start">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    Q
                  </span>
                  {faq.question}
                </h3>
                <p className="text-slate-600 leading-relaxed ml-9">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full mb-4">
              FIND US
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Visit Our Office
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Come and meet our team at our headquarters in Kalutara
            </p>
          </div>
          
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Google Map Embed */}
            <div className="w-full h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d79.96398741477136!3d6.527974624019507!2m3!1f0!2f0!3f0!3m2!1i1020!2i768!4f13.1!3m3!1m2!1s0x3ae22c3f6e6e2c7b%3A0x2f0c2e7b8b5b5b5b!2sKalutara!5e0!3m2!1sen!2slk!4v1633023226784!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BusZone+ Location"
              ></iframe>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
              <div className="flex items-center justify-center space-x-4">
                <Map className="h-8 w-8" />
                <div className="text-center">
                  <div className="text-xl font-bold">BusZone+ Headquarters</div>
                  <div className="text-blue-100">123 Galle Road, Kalutara, Sri Lanka</div>
                </div>
              </div>
            </div>
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
              Need Immediate Assistance?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Call us now for urgent bookings or inquiries. Our team is available 24/7 to help you with all your transportation needs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <a href="tel:+94704222777" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 group">
                <Phone className="h-6 w-6 group-hover:animate-bounce" />
                <span>Call +94 704 222 777</span>
              </a>
              
              <a href="mailto:info@buszoneplus.com" className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 group">
                <Mail className="h-6 w-6 group-hover:animate-pulse" />
                <span>Email Us</span>
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <Clock className="h-8 w-8 text-cyan-300 mx-auto mb-4" />
                <div className="text-white font-bold text-lg mb-2">24/7 Support</div>
                <div className="text-blue-100">Always here to help</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <Shield className="h-8 w-8 text-cyan-300 mx-auto mb-4" />
                <div className="text-white font-bold text-lg mb-2">Reliable Service</div>
                <div className="text-blue-100">Trusted by thousands</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <Award className="h-8 w-8 text-cyan-300 mx-auto mb-4" />
                <div className="text-white font-bold text-lg mb-2">Expert Team</div>
                <div className="text-blue-100">Professional drivers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer from AboutUs Page */}
      <Footer />
    </div>
  );
};

export default ContactUs;