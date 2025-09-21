import React, { useState } from 'react';
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
  Linkedin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import aboutImage from "../assets/contactus.jpg";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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

  // Footer Component from AboutUs Page
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-3 rounded-xl">
                <MapPin className="h-8 w-8 text-white" />
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
              className="flex items-center space-x-2 text-blue-400 hover:text-cyan-400 transition-colors"
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
            src={aboutImage} 
            alt="Contact BusZone+" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contact <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get in touch with us for any inquiries, quotes, or assistance. Our team is ready to help you with your transportation needs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Phone</h3>
                    <p className="text-slate-300">+94 704 222 777</p>
                    <p className="text-slate-400 text-sm">Mon-Sun, 24/7 support</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Email</h3>
                    <p className="text-slate-300">info@buszoneplus.com</p>
                    <p className="text-slate-400 text-sm">We respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Address</h3>
                    <p className="text-slate-300">123 Galle Road, Kalutara</p>
                    <p className="text-slate-300">Western Province, Sri Lanka</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
                    <p className="text-slate-300">Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p className="text-slate-300">Saturday: 9:00 AM - 5:00 PM</p>
                    <p className="text-slate-300">Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-slate-800 hover:bg-blue-500 p-3 rounded-xl transition-colors flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="bg-slate-800 hover:bg-pink-500 p-3 rounded-xl transition-colors flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="bg-slate-800 hover:bg-blue-400 p-3 rounded-xl transition-colors flex items-center justify-center">
                    <Twitter className="h-5 w-5 text-white" />
                  </a>
                  <a href="#" className="bg-slate-800 hover:bg-blue-600 p-3 rounded-xl transition-colors flex items-center justify-center">
                    <Linkedin className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50">
                <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Your Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageCircle className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                        placeholder="Query about bus rental"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                      placeholder="Please describe your requirements in detail..."
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
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

      {/* Map Section */}
      <div className="py-16 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Find Us Here</h2>
          
          <div className="rounded-3xl overflow-hidden shadow-2xl">
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
            
            <div className="bg-slate-800 p-6 flex items-center justify-center">
              <Map className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-slate-300">123 Galle Road, Kalutara, Sri Lanka</span>
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
          <h2 className="text-4xl font-bold text-white mb-6">Need Immediate Assistance?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Call us now for urgent bookings or inquiries. Our team is available 24/7 to help you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="tel:+94704222777" className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3">
              <Phone className="h-6 w-6" />
              <span>+94 704 222 777</span>
            </a>
            
            <a href="mailto:info@buszoneplus.com" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3">
              <Mail className="h-6 w-6" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer from AboutUs Page */}
      <Footer />
    </div>
  );
};

export default ContactUs;