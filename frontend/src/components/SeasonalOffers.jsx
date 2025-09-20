// pages/SeasonalOffersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Users, 
  Sparkles, 
  Star,
  Zap,
  Gift,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';


// Import seasonal images (you'll need to add these images to your assets folder)
// For now, using placeholder images from a service
const seasonalImages = {
  summer: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  winter: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
  spring: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400&h=300&fit=crop',
  autumn: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  monsoon: 'https://images.unsplash.com/photo-1590138155520-2dabd9a53a2d?w=400&h=300&fit=crop',
  default: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop'
};

const SeasonalOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('all');

  useEffect(() => {
    fetchAllSeasonalOffers();
  }, []);

  const fetchAllSeasonalOffers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/notifications/seasonal-offers`);
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching seasonal offers:', error);
      // Enhanced mock data with seasonal types
      const mockOffers = [
        {
          _id: '1',
          title: '☀️ Summer Special Discount',
          message: 'Beat the heat with our summer special! Get 25% off on all bookings to coastal destinations. Perfect for family vacations and beach getaways.',
          type: 'summer',
          targetUserType: 'passenger',
          expiryDate: '2024-08-31T23:59:59',
          isActive: true,
          discountPercent: 25,
          createdAt: '2024-05-01T10:00:00',
          popular: true,
          featured: true
        },
        {
          _id: '2',
          title: '❄️ Winter Holiday Package',
          message: 'Cozy up this winter with 30% discount on holiday packages. Perfect for Christmas and New Year celebrations in mountain destinations.',
          type: 'winter',
          targetUserType: 'passenger',
          expiryDate: '2024-12-25T23:59:59',
          isActive: true,
          discountPercent: 30,
          createdAt: '2024-10-01T09:30:00',
          popular: true
        },
        {
          _id: '3',
          title: '🌸 Spring Break Deal',
          message: 'Spring into savings! Special 20% discount for students during spring break. Valid with student ID on educational routes.',
          type: 'spring',
          targetUserType: 'student',
          expiryDate: '2024-04-30T23:59:59',
          isActive: true,
          discountPercent: 20,
          createdAt: '2024-02-15T14:20:00'
        },
        {
          _id: '4',
          title: '🍂 Autumn Adventure Offer',
          message: 'Experience the golden hues of autumn with 15% off on all adventure routes. Explore mountainous landscapes and fall foliage.',
          type: 'autumn',
          targetUserType: 'passenger',
          expiryDate: '2024-11-30T23:59:59',
          isActive: true,
          discountPercent: 15,
          createdAt: '2024-08-15T11:45:00'
        },
        {
          _id: '5',
          title: '🌧️ Monsoon Magic Discount',
          message: 'Don\'t let the rain dampen your plans! 10% discount on rainy day travels. Enjoy our premium service while staying dry.',
          type: 'monsoon',
          targetUserType: 'passenger',
          expiryDate: '2024-09-30T23:59:59',
          isActive: true,
          discountPercent: 10,
          createdAt: '2024-06-01T08:15:00'
        },
        {
          _id: '6',
          title: '🎉 Year-End Celebration',
          message: 'Ring in the new year with 35% off on all bookings for celebrations. Perfect for party destinations and city tours.',
          type: 'winter',
          targetUserType: 'passenger',
          expiryDate: '2024-12-31T23:59:59',
          isActive: true,
          discountPercent: 35,
          createdAt: '2024-11-01T13:20:00',
          featured: true
        }
      ];
      setOffers(mockOffers);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonImage = (seasonType) => {
    return seasonalImages[seasonType] || seasonalImages.default;
  };

  const getSeasonGradient = (seasonType) => {
    switch (seasonType) {
      case 'summer': return 'from-amber-500 to-orange-600';
      case 'winter': return 'from-blue-400 to-indigo-600';
      case 'spring': return 'from-green-400 to-emerald-600';
      case 'autumn': return 'from-orange-500 to-red-600';
      case 'monsoon': return 'from-slate-500 to-blue-700';
      default: return 'from-violet-600 to-purple-700';
    }
  };

  const getSeasonIcon = (seasonType) => {
    switch (seasonType) {
      case 'summer': return '☀️';
      case 'winter': return '❄️';
      case 'spring': return '🌸';
      case 'autumn': return '🍂';
      case 'monsoon': return '🌧️';
      default: return '🎁';
    }
  };

  const filteredOffers = selectedSeason === 'all' 
    ? offers 
    : offers.filter(offer => offer.type === selectedSeason);

  const seasons = [
    { id: 'all', name: 'All Seasons', icon: '🌎' },
    { id: 'summer', name: 'Summer', icon: '☀️' },
    { id: 'winter', name: 'Winter', icon: '❄️' },
    { id: 'spring', name: 'Spring', icon: '🌸' },
    { id: 'autumn', name: 'Autumn', icon: '🍂' },
    { id: 'monsoon', name: 'Monsoon', icon: '🌧️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-violet-700 to-purple-600 rounded-xl w-1/3 mb-8"></div>
            <div className="flex flex-wrap gap-3 mb-8">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div key={item} className="h-10 bg-slate-700 rounded-full w-24"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div key={item} className="bg-slate-800 rounded-2xl p-6 h-96">
                  <div className="h-40 bg-slate-700 rounded-xl mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-3"></div>
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded mb-4 w-3/4"></div>
                  <div className="h-10 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16">
    
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center mb-4 lg:mb-0">
            <Link 
              to="/booking" 
              className="flex items-center text-violet-400 hover:text-violet-300 mr-6 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Back to Booking
            </Link>
            <div className="flex items-center">
              <div className="relative">
                <Tag className="h-10 w-10 mr-4 text-amber-400" />
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Seasonal Offers
                </h1>
                <p className="text-slate-400 mt-1">
                  Discover amazing deals for every season
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-3">
            <span className="text-slate-300 mr-3">Showing:</span>
            <span className="text-amber-400 font-semibold">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'}
            </span>
          </div>
        </div>

        {/* Season Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-amber-400" />
            Filter by Season
          </h2>
          <div className="flex flex-wrap gap-3">
            {seasons.map(season => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  selectedSeason === season.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-lg mr-2">{season.icon}</span>
                <span className="font-medium">{season.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => {
            const seasonGradient = getSeasonGradient(offer.type);
            const seasonIcon = getSeasonIcon(offer.type);
            
            return (
              <div 
                key={offer._id} 
                className="group relative bg-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                {/* Background Image */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={getSeasonImage(offer.type)} 
                    alt={offer.type} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80`}></div>
                  
                  {/* Premium Badge */}
                  {offer.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      Featured
                    </div>
                  )}
                  
                  {/* Season Badge */}
                  <div className="absolute top-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {seasonIcon} {offer.type.charAt(0).toUpperCase() + offer.type.slice(1)}
                  </div>
                  
                  {/* Discount Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-4 py-2 rounded-xl font-bold text-lg shadow-lg">
                      {offer.discountPercent}% OFF
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {offer.title}
                  </h3>
                  
                  <p className="text-slate-300 mb-4 leading-relaxed line-clamp-3">
                    {offer.message}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-400">
                      <Users className="h-4 w-4 mr-2" />
                      <span>For: {offer.targetUserType || 'All Passengers'}</span>
                    </div>
                    
                    {offer.expiryDate && (
                      <div className="flex items-center text-sm text-slate-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Valid until: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-slate-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Added: {new Date(offer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 group-hover:shadow-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Claim This Offer
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${seasonGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
              </div>
            );
          })}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <Tag className="h-24 w-24 text-violet-600/50 mx-auto" />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              No {selectedSeason !== 'all' ? selectedSeason : ''} Offers Available
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {selectedSeason !== 'all' 
                ? `Check back later for ${selectedSeason} season offers!`
                : 'No seasonal offers available at the moment. Please check back soon!'
              }
            </p>
            {selectedSeason !== 'all' && (
              <button
                onClick={() => setSelectedSeason('all')}
                className="mt-4 bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                View All Seasons
              </button>
            )}
          </div>
        )}
      </div>
      
      
    </div>
  );
};

export default SeasonalOffersPage;