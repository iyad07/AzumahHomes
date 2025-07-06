
import { useEffect, useRef, useState } from "react";
import { Users, Home, Award, ThumbsUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
}

const StatItem = ({ icon, value, label, suffix }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000; // 2 seconds
          const step = Math.ceil(value / (duration / 16)); // 16ms per frame (approx. 60fps)
          
          const timer = setInterval(() => {
            start += step;
            if (start > value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
          
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [value, hasAnimated]);

  return (
    <div ref={elementRef} className="text-center p-8 flex flex-col items-center animate-counter-animation">
      <div className="bg-orange-50 p-4 rounded-full mb-4 text-real-orange">
        {icon}
      </div>
      <h3 className="text-4xl font-bold mb-2">
        {count}
        <span className="text-real-blue">{suffix}</span>
      </h3>
      <p className="text-gray-500">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState([
    { icon: <Home size={32} />, value: 0, label: "Properties Listed", suffix: "+" },
    { icon: <Users size={32} />, value: 0, label: "Verified Users", suffix: "+" },
    { icon: <ThumbsUp size={32} />, value: 0, label: "Satisfied Clients", suffix: "+" },
    { icon: <Award size={32} />, value: 20, label: "Awards Won", suffix: "+" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get property count
        const { count: propertyCount, error: propertyError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        
        if (propertyError) throw propertyError;
        
        // Get user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Update stats with real data
        setStats(prev => [
          { ...prev[0], value: propertyCount || 0 },
          { ...prev[1], value: userCount || 0 },
          // For satisfied clients, we'll use a formula based on properties
          { ...prev[2], value: Math.floor((propertyCount || 0) * 1.5) },
          // Keep awards as is
          prev[3]
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatItem
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
