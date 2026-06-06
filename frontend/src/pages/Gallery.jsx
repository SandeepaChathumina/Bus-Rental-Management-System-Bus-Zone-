import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Bus,
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  Share2,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Clock,
  Star,
  Facebook,
  Share
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import gallery images
import gallery1 from "../assets/buspic1.webp";
import gallery2 from "../assets/buspic2.webp";
import gallery3 from "../assets/buspic3.webp";
import gallery4 from "../assets/buspic4.webp";
import gallery5 from "../assets/busimg5.jpg";
import gallery6 from "../assets/busimg6.webp";

const Gallery = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedImages, setLikedImages] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        closeModal();
      }
    };
    
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  const categories = [
    { id: 'all', name: 'All Photos', count: 6 },
    { id: 'luxury', name: 'Luxury', count: 2 },
    { id: 'corporate', name: 'Corporate', count: 1 },
    { id: 'events', name: 'Events', count: 2 },
    { id: 'tours', name: 'Tours', count: 1 }
  ];

  const galleryImages = [
    {
      id: 1,
      src: gallery1,
      title: "Executive Luxury Coach",
      category: "luxury",
      description: "Premium 50-seater bus with luxury amenities including WiFi, entertainment systems, and comfortable reclining seats.",
      date: "2024-01-15",
      likes: 24
    },
    {
      id: 2,
      src: gallery2,
      title: "Corporate Transport",
      category: "corporate",
      description: "Professional transportation solution for business events and corporate gatherings.",
      date: "2024-01-20",
      likes: 18
    },
    {
      id: 3,
      src: gallery3,
      title: "Wedding Special",
      category: "events",
      description: "Elegantly decorated bus for wedding parties and special occasions.",
      date: "2024-01-25",
      likes: 32
    },
    {
      id: 4,
      src: gallery4,
      title: "Tourist Charter",
      category: "tours",
      description: "Comfortable travel bus perfect for sightseeing and tourist groups.",
      date: "2024-02-01",
      likes: 28
    },
    {
      id: 5,
      src: gallery5,
      title: "Premium Interior",
      category: "luxury",
      description: "Luxurious interior with modern facilities and spacious seating arrangement.",
      date: "2024-02-05",
      likes: 15
    },
    {
      id: 6,
      src: gallery6,
      title: "Party Bus",
      category: "events",
      description: "Entertainment-focused bus with LED lighting and sound system for celebrations.",
      date: "2024-02-10",
      likes: 22
    }
  ];

  const filteredImages = galleryImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const nextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const toggleLike = (imageId) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const downloadImage = async (imageSrc, imageName) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buszone-${imageName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const shareImage = async (image) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
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

      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
            alt="BusZone+ Gallery" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-cyan-900/80"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-cyan-400 text-sm font-semibold rounded-full border border-cyan-400/30">
                  PHOTO GALLERY
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight">
                Our <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Gallery</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Explore our premium fleet, memorable events, and beautiful destinations through our photo collection
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                  href="https://www.facebook.com/share/18RHVvA5P5/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Facebook className="h-5 w-5" />
                  <span>Visit Our Facebook</span>
                </a>
                
                <button className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>View Gallery</span>
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

      {/* Gallery Controls */}
      <div className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => openModal(image)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{image.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{image.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{image.date}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(image.id);
                          }}
                          className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                        >
                          <Heart 
                            className={`w-4 h-4 ${likedImages.has(image.id) ? 'text-red-500 fill-current' : ''}`}
                          />
                          <span>{image.likes}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image.src, image.title);
                          }}
                          className="hover:text-blue-500 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareImage(image);
                          }}
                          className="hover:text-green-500 transition-colors"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => openModal(image)}
                >
                  <div className="flex">
                    <div className="relative w-48 h-32 flex-shrink-0">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{image.title}</h3>
                      <p className="text-slate-600 mb-4">{image.description}</p>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{image.date}</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{image.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No photos found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleModalClick}
        >
          <div className="relative max-w-6xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-16 right-0 z-20 text-white hover:text-red-400 transition-colors duration-300 bg-red-600/80 hover:bg-red-600 backdrop-blur-sm rounded-full p-3 shadow-lg"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Close button inside image area */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-300 shadow-lg z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Navigation arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-gray-300 mb-4">{selectedImage.description}</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedImage.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{selectedImage.likes} likes</span>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => toggleLike(selectedImage.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    likedImages.has(selectedImage.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white hover:bg-red-500/50'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${likedImages.has(selectedImage.id) ? 'fill-current' : ''}`}
                  />
                  <span>{likedImages.has(selectedImage.id) ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={() => downloadImage(selectedImage.src, selectedImage.title)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white hover:bg-blue-500/50 rounded-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => shareImage(selectedImage)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white hover:bg-green-500/50 rounded-lg transition-all duration-300"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
