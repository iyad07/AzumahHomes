
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEO 
        title="About Azumah Homes - Flexible Rent-to-Own Real Estate Solutions"
        description="Azumah Homes is a real estate startup dedicated to making homeownership more flexible, transparent, and accessible for all Ghanaians through our innovative rent-to-own model."
        keywords="about Azumah Homes, rent to own Ghana, flexible real estate, transparent property solutions, Greater Accra properties"
        url="https://azumahhomes.vercel.app/about"
      />
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">About Azumah Homes</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Azumah Homes is a real estate startup dedicated to making homeownership more flexible, transparent, and accessible for all. 
              We understand that for many Ghanaians, buying a home is both a major financial decision and a deeply personal milestone.
            </p>
            <p className="text-gray-600 mb-6">
              That's why we've built a rent-to-own model that puts your needs first — offering verified properties, fair pricing, 
              and flexible payment options designed to meet real budgets. Whether you're a first-time buyer, a growing family, 
              or an investor, Azumah Homes provides tailored property solutions across Greater Accra.
            </p>
            <p className="text-gray-600 mb-6">
              From modern apartments to gated family homes, we focus on quality listings that are secure, properly documented, 
              and free from hidden complications. <strong>Secure. Flexible. Transparent.</strong> That's the Azumah way.
            </p>
          </div>
          
          <div className="relative">
            <img 
              src="/placeholder.svg" 
              alt="Azumah Homes Office"
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Secure</h3>
              <p className="text-gray-600">
                All our properties are verified, properly documented, and free from 
                hidden complications, ensuring your investment is protected.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Flexible</h3>
              <p className="text-gray-600">
                Our rent-to-own model offers flexible payment options designed to 
                meet real budgets and make homeownership accessible to all.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Transparent</h3>
              <p className="text-gray-600">
                We believe in honest, transparent dealings with fair pricing 
                and no hidden fees or complications.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Add team member components here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
