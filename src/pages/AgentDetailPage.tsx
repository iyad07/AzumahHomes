import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Star, ArrowLeft, Building, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AgentType {
  id: string;
  name: string;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  specialties: string[];
  email: string;
  phone: string;
  experience: string;
}

const AgentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('role', 'admin')
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Transform the data to match AgentType
          const agentData: AgentType = {
            id: data.id,
            name: data.full_name || 'Unknown',
            image: data.avatar_url || '/placeholder.svg',
            title: data.title || 'Real Estate Agent',
            location: data.location || 'Not specified',
            rating: data.rating || 4.5,
            reviews: data.reviews || 0,
            specialties: data.specialties || ['Residential', 'Commercial'],
            email: data.email || '',
            phone: data.phone || '',
            experience: data.experience || '5+ years'
          };
          setAgent(agentData);
        }
      } catch (error: any) {
        console.error('Error fetching agent:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agent details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>Loading agent details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Agent Not Found</h1>
            <p className="text-gray-600 mb-8">The agent profile you're looking for doesn't exist.</p>
            <Link to="/agents">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agents
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <Link to="/agents" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Agent Image */}
            <div className="md:w-1/3">
              <img 
                src={agent.image} 
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Agent Info */}
            <div className="p-8 md:w-2/3">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                  <p className="text-gray-600 text-lg">{agent.title}</p>
                </div>
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-gray-500 ml-1">({agent.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {agent.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  {agent.experience} Experience
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <a href={`mailto:${agent.email}`} className="hover:text-real-orange">
                    {agent.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  <a href={`tel:${agent.phone}`} className="hover:text-real-orange">
                    {agent.phone}
                  </a>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {agent.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Agent
                </Button>
                <Button variant="outline" className="flex-1">
                  <Building className="mr-2 h-4 w-4" />
                  View Listings
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="p-8 border-t">
            <h2 className="text-2xl font-semibold mb-6">About {agent.name}</h2>
            <p className="text-gray-600 leading-relaxed">
              With {agent.experience} of experience in real estate, {agent.name} has established a strong reputation for delivering exceptional results and personalized service to clients. Specializing in {agent.specialties.join(', ')}, {agent.name} brings deep market knowledge and professional expertise to every transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
