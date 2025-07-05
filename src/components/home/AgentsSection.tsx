
import { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Agent {
  id: number;
  name: string;
  position: string;
  image: string;
  phone: string;
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
}

// Default agent data to use if we don't have enough real users
const defaultAgents: Agent[] = [
  {
    id: 1,
    name: "John Smith",
    position: "Real Estate Agent",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    phone: "+1 (234) 567-8901",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Property Consultant",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    phone: "+1 (234) 567-8902",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    id: 3,
    name: "Michael Brown",
    position: "Luxury Home Specialist",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1148&q=80",
    phone: "+1 (234) 567-8903",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
  {
    id: 4,
    name: "Emily Davis",
    position: "Commercial Real Estate",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
    phone: "+1 (234) 567-8904",
    social: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
    },
  },
];

// Agent profile images based on gender
const profileImages = {
  male: [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1148&q=80",
    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  ],
  female: [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
    "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  ]
};

// Job titles for agents
const jobTitles = [
  "Real Estate Agent",
  "Property Consultant",
  "Luxury Home Specialist",
  "Commercial Real Estate",
  "Senior Agent",
  "Property Manager"
];

const AgentsSection = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        // Get users from profiles table with admin role only
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin') // Only fetch profiles with admin role
          .limit(4); // Limit to 4 agents for display
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert profiles to agent format
          const agentData: Agent[] = data.map((profile, index) => {
            // Randomly assign gender for profile image
            const gender = Math.random() > 0.5 ? 'male' : 'female';
            const imageArray = profileImages[gender as keyof typeof profileImages];
            const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];
            
            // Randomly assign job title
            const randomTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
            
            return {
              id: index + 1,
              name: profile.full_name || `Agent ${index + 1}`,
              position: randomTitle,
              image: randomImage,
              phone: profile.phone || "+1 (234) 567-89XX",
              social: {
                facebook: "#",
                twitter: "#",
                linkedin: "#",
              },
            };
          });
          
          setAgents(agentData);
        } else {
          // If no admin profiles found, use default agents
          setAgents(defaultAgents);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        // Fallback to default agents on error
        setAgents(defaultAgents);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Meet Our Agents</h2>
          <p className="section-subtitle mx-auto">
            Our professional agents are here to guide you through your real estate journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading agents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card">
                <div className="agent-image-wrapper">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="agent-image"
                  />
                  <div className="agent-social">
                    <a 
                      href={agent.social.facebook} 
                      className="social-icon"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a 
                      href={agent.social.twitter} 
                      className="social-icon"
                      aria-label="Twitter"
                    >
                      <Twitter size={18} />
                    </a>
                    <a 
                      href={agent.social.linkedin} 
                      className="social-icon"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={18} />
                    </a>
                  </div>
                </div>
                <div className="agent-info">
                  <h3 className="agent-name">{agent.name}</h3>
                  <p className="agent-position">{agent.position}</p>
                  <div className="agent-contact">
                    <Phone size={16} className="mr-2" />
                    <span>{agent.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentsSection;
