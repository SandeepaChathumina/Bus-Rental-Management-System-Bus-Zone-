import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, Facebook, Share, Heart } from "lucide-react";

// Import gallery images
import gallery1 from "../assets/buspic1.webp";
import gallery2 from "../assets/buspic2.webp";
import gallery3 from "../assets/buspic3.webp";
import gallery4 from "../assets/buspic4.webp";
import gallery5 from "../assets/busimg5.jpg";
import gallery6 from "../assets/busimg6.webp";

const GalleryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [likedImages, setLikedImages] = useState(new Set());

  const galleryImages = [
    {
      id: 1,
      src: gallery1,
      title: "Executive Luxury Coach",
      category: "Luxury",
      description: "Premium 50-seater bus with luxury amenities including WiFi, entertainment systems, and comfortable reclining seats.",
      date: "2024-01-15"
    },
    {
      id: 2,
      src: gallery2,
      title: "Corporate Transport",
      category: "Corporate",
      description: "Professional transportation solution for business events and corporate gatherings.",
      date: "2024-01-20"
    },
    {
      id: 3,
      src: gallery3,
      title: "Wedding Special",
      category: "Events",
      description: "Elegantly decorated bus for wedding parties and special occasions.",
      date: "2024-01-25"
    },
    {
      id: 4,
      src: gallery4,
      title: "Tourist Charter",
      category: "Tours",
      description: "Comfortable travel bus perfect for sightseeing and tourist groups.",
      date: "2024-02-01"
    },
    {
      id: 5,
      src: gallery5,
      title: "Premium Interior",
      category: "Luxury",
      description: "Luxurious interior with modern facilities and spacious seating arrangement.",
      date: "2024-02-05"
    },
    {
      id: 6,
      src: gallery6,
      title: "Party Bus",
      category: "Events",
      description: "Entertainment-focused bus with LED lighting and sound system for celebrations.",
      date: "2024-02-10"
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.state?.initialIndex !== undefined) {
      setCurrentIndex(location.state.initialIndex);
    }
  }, [location.state]);

  const openLightbox = (index) => {
    setSelectedImage(galleryImages[index]);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(galleryImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(galleryImages[prevIndex]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Our Gallery
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Explore our premium bus fleet and memorable journeys through stunning visuals
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="https://www.facebook.com/share/18RHVvA5P5/?mibextid=wwXIfr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Facebook className="h-4 w-4" />
              <span>Visit Our Facebook</span>
            </a>
            
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105 cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                      {image.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(image.id);
                      }}
                      className="p-2 bg-black/50 rounded-full backdrop-blur-sm"
                    >
                      <Heart 
                        className={`h-4 w-4 transition-all duration-300 ${
                          likedImages.has(image.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-white'
                        }`}
                      />
                    </button>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {image.title}
                  </h3>
                  <p className="text-slate-300 text-sm line-clamp-2">
                    {image.description}
                  </p>
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image.src, image.title);
                    }}
                    className="bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-blue-500 transition-colors"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      shareImage(image);
                    }}
                    className="bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-green-500 transition-colors"
                  >
                    <Share className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="relative max-w-6xl max-h-full mx-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-16 right-0 z-10 text-white hover:text-blue-400 transition-colors duration-300"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-blue-500/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 group"
            >
              <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-blue-500/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 group"
            >
              <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 rounded-b-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                    {selectedImage.category}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleLike(selectedImage.id)}
                      className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-red-500/50 transition-colors"
                    >
                      <Heart 
                        className={`h-5 w-5 transition-all duration-300 ${
                          likedImages.has(selectedImage.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-white'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => downloadImage(selectedImage.src, selectedImage.title)}
                      className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-blue-500/50 transition-colors"
                    >
                      <Download className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => shareImage(selectedImage)}
                      className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-green-500/50 transition-colors"
                    >
                      <Share className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">
                  {selectedImage.title}
                </h3>
                <p className="text-slate-300 text-lg">
                  {selectedImage.description}
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Added on {new Date(selectedImage.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Experience Luxury Travel?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Book your premium bus rental today and travel in style
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Book Your Bus Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;