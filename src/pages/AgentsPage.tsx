
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import SEO from "@/components/SEO";

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // Get users from profiles table with admin role only
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin'); // Only fetch profiles with admin role
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform the data to match the agent format
          const formattedAgents = data.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'Agent Name',
            image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80', // Default image
            title: 'Real Estate Agent',
            location: profile.address || 'Location not specified',
            rating: 4.8,
            reviews: 50,
            specialties: ['Residential', 'Commercial', 'Property Management'],
            email: profile.email,
            phone: profile.phone || 'Phone not provided',
            experience: '5+ years'
          }));
          
          setAgents(formattedAgents);
        } else {
          // If no admin profiles found, keep the default static data
          // The existing static data will remain
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        // The existing static data will remain on error
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEO 
        title="Meet Our Expert Real Estate Agents | Azumah Homes"
        description="Connect with Azumah Homes' professional real estate agents. Our experienced team is ready to help you buy, sell, or rent properties across Ghana."
        keywords="real estate agents Ghana, property agents, Azumah Homes team, professional realtors Ghana"
        url="https://azumahhomes.vercel.app/agents"
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Meet Our Expert Agents</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team of experienced real estate professionals is dedicated to helping you
            find your perfect property. With years of market expertise and local knowledge,
            we're here to guide you through your real estate journey.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading agents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-white py-1 px-3 rounded-full flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span>{agent.rating}</span>
                    <span className="text-gray-500 text-sm">({agent.reviews} reviews)</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                  <p className="text-gray-600 mb-2">{agent.title}</p>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={16} className="mr-1" />
                    {agent.location}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.specialties.map((specialty, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      <a href={`mailto:${agent.email}`} className="hover:text-real-orange">
                        {agent.email}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-2" />
                      <a href={`tel:${agent.phone}`} className="hover:text-real-orange">
                        {agent.phone}
                      </a>
                    </div>
                  </div>
                  <Link 
                    to={`/agents/${agent.id}`} 
                    state={{ agent: agent }}
                  >
                    <Button className="w-full">View Profile</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsPage;
