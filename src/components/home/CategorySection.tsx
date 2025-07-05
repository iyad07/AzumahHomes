
import { useState, useEffect } from "react";
import { Home, Building2, Building, Warehouse, Hotel, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Category {
  name: string;
  count: number;
  icon: React.ReactNode;
  link: string;
}

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      name: "Apartment",
      count: 0,
      icon: <Building2 size={40} className="text-real-blue" />,
      link: "/properties?category=apartment",
    },
    {
      name: "House",
      count: 0,
      icon: <Home size={40} className="text-real-blue" />,
      link: "/properties?category=house",
    },
    {
      name: "Office",
      count: 0,
      icon: <Building size={40} className="text-real-blue" />,
      link: "/properties?category=office",
    },
    {
      name: "Villa",
      count: 0,
      icon: <Hotel size={40} className="text-real-blue" />,
      link: "/properties?category=villa",
    },
    {
      name: "Studio",
      count: 0,
      icon: <Warehouse size={40} className="text-real-blue" />,
      link: "/properties?category=studio",
    },
    {
      name: "Garage",
      count: 0,
      icon: <Car size={40} className="text-real-blue" />,
      link: "/properties?category=garage",
    },
  ]);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        // Get all properties
        const { data, error } = await supabase
          .from('properties')
          .select('tag');
        
        if (error) throw error;
        
        if (data) {
          // Count properties by category
          const counts: Record<string, number> = {};
          
          data.forEach(property => {
            const tag = property.tag.toLowerCase();
            counts[tag] = (counts[tag] || 0) + 1;
          });
          
          // Update categories with real counts
          setCategories(prev => 
            prev.map(category => ({
              ...category,
              count: counts[category.name.toLowerCase()] || 0
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };
    
    fetchCategoryCounts();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Explore by Category</h2>
          <p className="section-subtitle mx-auto">
            Find your perfect property from our wide range of options across different categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              to={category.link}
              key={category.name}
              className="category-card"
            >
              <div className="category-icon">
                {category.icon}
              </div>
              <h3 className="font-medium text-lg mb-1">{category.name}</h3>
              <p className="text-gray-500 text-sm">{category.count} Properties</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
