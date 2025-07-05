
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [priceRange, setPriceRange] = useState([50000, 800000]);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: "",
    location: ""
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch unique locations from properties table
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('location');
        
        if (error) throw error;
        
        if (data) {
          // Extract unique locations
          const uniqueLocations = Array.from(new Set(data.map(item => item.location)));
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    // Fetch unique categories (property types) from properties table
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('tag');
        
        if (error) throw error;
        
        if (data) {
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(data.map(item => item.tag)));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchLocations();
    fetchCategories();
  }, []);
  
  const formatPrice = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to properties page with search filters
    const queryParams = new URLSearchParams();
    
    if (searchParams.query) queryParams.append("query", searchParams.query);
    if (searchParams.category) queryParams.append("category", searchParams.category);
    if (searchParams.location) queryParams.append("location", searchParams.location);
    
    navigate(`/properties?${queryParams.toString()}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center">
      {/* Background image with dark overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Centered Heading and Search UI */}
      <div className="relative z-10 max-w-4xl w-full px-4">
        {/* Main Heading */}
        <h1 className="text-white text-4xl md:text-6xl font-extrabold mb-4">Journey To Your Perfect</h1>
        <h2 className="text-white text-4xl md:text-6xl font-extrabold mb-10">Luxury Home</h2>

        {/* Tabs: General, Villa, Apartment */}
        <div className="flex justify-center mb-6 ">
          <Tabs defaultValue="general" className="bg-white/50 backdrop-blur-md p-1 rounded-full shadow-lg">
            <TabsList className="grid-row grid-cols-3 gap-1 bg-transparent">
              <TabsTrigger value="general" className="px-6 py-2 text-white data-[state=active]:bg-orange-500 rounded-full">General</TabsTrigger>
              <TabsTrigger value="villa" className="px-6 py-2 text-white data-[state=active]:bg-orange-500 rounded-full">Villa</TabsTrigger>
              <TabsTrigger value="apartment" className="px-6 py-2 text-white data-[state=active]:bg-orange-500 rounded-full">Apartment</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white/20 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 ">
            <Input 
              placeholder="Looking For?" 
              className="col-span-1" 
              value={searchParams.query}
              onChange={(e) => handleInputChange("query", e.target.value)}
            />
            <Select onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="bg-transparent text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleInputChange("location", value)}>
              <SelectTrigger className="bg-transparent text-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="East Legon">East Legon</SelectItem>
                    <SelectItem value="Madina">Madina</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
