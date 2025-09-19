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
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import about from "../assets/about.jpg";

// Import about image (you'll need to add this to your assets)
// import aboutImage from "../assets/about.jpg";

const AboutUs = () => {
  const navigate = useNavigate();

  // Using a placeholder image since we don't have the actual about.jpg
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
    { number: "15+", label: "Years Experience" },
    { number: "150+", label: "Premium Buses" },
    { number: "50,000+", label: "Happy Customers" },
    { number: "99.8%", label: "On-Time Record" }
  ];

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

      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                About <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">BusZone+</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                BusZone+ (operated by Laksiri Tours) is a well-established transportation service provider specializing in 
                bus rentals for events, city transfers, and long-distance tours. The company operates from its head office 
                in Kalutara and has built a strong reputation for reliability and timely service.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{stat.number}</div>
                    <div className="text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl z-0"></div>
              <img 
                src={aboutImage} 
                alt="About BusZone+" 
                className="rounded-3xl shadow-2xl relative z-10 w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl z-0"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              The principles that guide everything we do and ensure we deliver exceptional service to our clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl w-fit mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-slate-400">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-6 text-slate-300">
                <p>
                  Founded over 15 years ago, Laksiri Tours began as a small family business with just a few vehicles. 
                  Through dedication to quality service and customer satisfaction, we've grown into one of the most 
                  trusted transportation providers in the region.
                </p>
                <p>
                  Our journey has been guided by a simple philosophy: provide reliable, comfortable, and safe 
                  transportation that exceeds customer expectations. This commitment has allowed us to build 
                  long-term relationships with corporate clients, tour operators, and individual customers alike.
                </p>
                <p>
                  Today, BusZone+ represents the next chapter in our story - combining our traditional values of 
                  excellent service with modern amenities and a expanding fleet of luxury vehicles.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-3xl text-center">
                <Users className="h-12 w-12 text-white mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-blue-100">Professional Staff</div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-center border border-slate-700/50">
                <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-slate-400">Destinations Served</div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-center border border-slate-700/50">
                <Award className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">12</div>
                <div className="text-slate-400">Industry Awards</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-3xl text-center">
                <Shield className="h-12 w-12 text-white mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Safety Record</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Premium Travel?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Contact us today to discuss your transportation needs and get a personalized quote.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
              <Phone className="h-6 w-6 text-white" />
              <span className="text-white font-semibold">+94 704 222 777</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
              <Mail className="h-6 w-6 text-white" />
              <span className="text-white font-semibold">info@buszoneplus.com</span>
            </div>
          </div>
          
          <div className="mt-10 bg-slate-900/30 inline-flex items-center px-6 py-3 rounded-2xl border border-slate-700/50">
            <MapPin className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-slate-300">Head Office: Kalutara, Sri Lanka</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              BusZone+
            </div>
          </div>
          <p className="text-slate-400 mb-6">Premium Transportation Solutions</p>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} BusZone+ (Laksiri Tours). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;