
import { useState, useEffect } from "react";
import { Search, MapPin, Home, Building2, Check, ChevronsUpDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { PropertyType, PropertyCategory } from "@/types/property";
import { usePropertyStats } from "@/hooks/useProperties";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const HeroSection = () => {
  const [priceRange, setPriceRange] = useState([50000, 800000]);
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: "",
    location: ""
  });
  const [locations, setLocations] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  usePropertyStats();
  const navigate = useNavigate();

  // Fetch locations from database
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

    fetchLocations();
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

        {/* Tabs: General, House, Apartment */}
        <div className="flex justify-center mb-6 ">
          <Tabs defaultValue="general" className="bg-white/50 backdrop-blur-md p-1 rounded-full shadow-lg">
            <TabsList className="grid-row grid-cols-3 gap-1 bg-transparent">
              <TabsTrigger value="general" className="px-6 py-2 text-white data-[state=active]:bg-orange-500 rounded-full">General</TabsTrigger>
              <TabsTrigger value="house" className="px-6 py-2 text-white data-[state=active]:bg-orange-500 rounded-full">House</TabsTrigger>
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
                <SelectItem value={PropertyCategory.FOR_SALE}>For Sale</SelectItem>
                <SelectItem value={PropertyCategory.FOR_RENT}>For Rent</SelectItem>
              </SelectContent>
            </Select>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="col-span-1 justify-between bg-transparent text-white border-white/20 hover:bg-white/10"
                >
                  {searchParams.location || "Enter Location"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search location..." 
                    value={searchParams.location}
                    onValueChange={(value) => handleInputChange("location", value)}
                  />
                  <CommandList>
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandGroup>
                      {locations.map((location) => (
                        <CommandItem
                          key={location}
                          value={location}
                          onSelect={(currentValue) => {
                            handleInputChange("location", currentValue === searchParams.location ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              searchParams.location === location ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {location}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
