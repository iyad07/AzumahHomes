
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const AboutSection = () => {
  const features = [
    "Find Your Dream Home",
    "Experienced Agents",
    "Transparent Process",
    "Reliable Service",
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
              alt="Modern living room with large windows"
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-lg shadow-lg hidden md:block">
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wider">Since</p>
                <p className="text-4xl font-bold text-real-blue">2010</p>
                <p className="text-sm text-gray-500">Trusted by thousands</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="section-title">
              Real Estate Solutions Made Easy
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              At Azumah Homes, we believe that finding your perfect property should be a
              joyful experience. Our team of dedicated professionals is committed to
              making your real estate journey seamless and successful.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="text-real-blue mr-3" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-800">12+</span>
                <span className="text-gray-500">Years Experience</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-800">400+</span>
                <span className="text-gray-500">Agents</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-800">5000+</span>
                <span className="text-gray-500">Happy Clients</span>
              </div>
            </div>

            <Button asChild className="mt-8">
              <Link to="/about">Explore More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
