
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Location {
  id: number;
  name: string;
  image: string;
  count: number;
}

// Default location images to use if we don't have real data
const locationImages = {
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80",
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80",
  "Melbourne": "https://images.unsplash.com/photo-1545044846-351ba102b6d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
  "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  // Add a default image for any location not in this list
  "default": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
};

const LocationsSection = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        // Get all properties
        const { data, error } = await supabase
          .from('properties')
          .select('location');
        
        if (error) throw error;
        
        if (data) {
          // Count properties by location and create location objects
          const locationCounts: Record<string, number> = {};
          
          data.forEach(property => {
            const location = property.location;
            locationCounts[location] = (locationCounts[location] || 0) + 1;
          });
          
          // Convert to array of location objects
          const locationArray: Location[] = Object.entries(locationCounts)
            .map(([name, count], index) => ({
              id: index + 1,
              name,
              count,
              image: locationImages[name as keyof typeof locationImages] || locationImages.default
            }))
            .sort((a, b) => b.count - a.count) // Sort by count (highest first)
            .slice(0, 6); // Take top 6 locations
          
          setLocations(locationArray);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocationData();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Top Locations</h2>
          <p className="section-subtitle mx-auto">
            Explore properties in our most popular cities around the world
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading location data...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <p>No location data available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Link
                key={location.id}
                to={`/properties?location=${encodeURIComponent(location.name)}`}
                className="location-card"
              >
                <img 
                  src={location.image} 
                  alt={location.name} 
                  className="location-card-image"
                />
                <div className="location-card-overlay"></div>
                <div className="location-card-content">
                  <h3 className="text-xl font-semibold mb-1">{location.name}</h3>
                  <p>{location.count} Properties</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationsSection;
