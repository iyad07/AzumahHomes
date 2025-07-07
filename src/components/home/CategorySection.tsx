
import { useState, useEffect } from "react";
import { Home, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";

interface Category {
  name: string;
  count: number;
  icon: React.ReactNode;
  link: string;
}

const CategorySection = () => {
  const { typeCounts, loading } = useProperties();
  
  const categories: Category[] = [
    {
      name: "Apartment",
      count: typeCounts.apartment || 0,
      icon: <Building2 size={40} className="text-real-blue" />,
      link: "/properties?type=apartment",
    },
    {
      name: "House",
      count: typeCounts.house || 0,
      icon: <Home size={40} className="text-real-blue" />,
      link: "/properties?type=house",
    },
  ];

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-subtitle mx-auto">
              Find your perfect property from our wide range of options across different categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="category-card animate-pulse">
                <div className="category-icon">
                  <div className="w-10 h-10 bg-gray-300 rounded"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Explore by Category</h2>
          <p className="section-subtitle mx-auto">
            Find your perfect property from our wide range of options across different categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
