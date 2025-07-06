import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SearchParameters {
  location: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParameters, setSearchParameters] = useState<SearchParameters>({
    location: '',
    category: '',
    minPrice: null,
    maxPrice: null
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('location')
          .not('location', 'is', null);

        if (error) throw error;

        const uniqueLocations = [...new Set(data?.map(item => item.location) || [])];
        setLocations(uniqueLocations.filter(Boolean));
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('tag')
          .not('tag', 'is', null);

        if (error) throw error;

        const uniqueCategories = [...new Set(data?.map(item => item.tag) || [])];
        setCategories(uniqueCategories.filter(Boolean));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchLocations();
    fetchCategories();
  }, []);

  const handleInputChange = (field: keyof SearchParameters, value: string | number | null) => {
    setSearchParameters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (searchParameters.location) {
      searchParams.set('location', searchParameters.location);
    }
    if (searchParameters.category) {
      searchParams.set('category', searchParameters.category);
    }
    if (searchParameters.minPrice) {
      searchParams.set('minPrice', searchParameters.minPrice.toString());
    }
    if (searchParameters.maxPrice) {
      searchParams.set('maxPrice', searchParameters.maxPrice.toString());
    }
    
    navigate(`/properties?${searchParams.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-real-blue to-blue-800">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Find Your Dream Home
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
          Discover the perfect property in Ghana's most desirable locations
        </p>
        
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                value={searchParameters.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-real-blue focus:border-transparent text-gray-700"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <select
                value={searchParameters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-real-blue focus:border-transparent text-gray-700"
              >
                <option value="">All Types</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Min Price</label>
              <input
                type="number"
                placeholder="Min Price"
                value={searchParameters.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-real-blue focus:border-transparent text-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Max Price</label>
              <input
                type="number"
                placeholder="Max Price"
                value={searchParameters.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-real-blue focus:border-transparent text-gray-700"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-real-orange text-white py-3 px-6 rounded-md hover:bg-orange-600 transition-colors font-semibold"
          >
            Search Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;