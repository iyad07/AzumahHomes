
const AboutPage = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">About Azumah Homes</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Founded in 2010, Azumah Homes has grown to become one of the most trusted names in real estate. 
              Our journey began with a simple mission: to help people find their perfect homes while providing 
              exceptional service and expertise.
            </p>
            <p className="text-gray-600 mb-6">
              Today, we're proud to have helped thousands of families find their dream homes and investors 
              make smart property decisions. Our success is built on our commitment to transparency, 
              integrity, and customer satisfaction.
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
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-gray-600">
                We believe in honest, transparent dealings with all our clients, 
                building trust through every interaction.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect of our service, 
                from property selection to client communication.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We embrace modern technology and innovative solutions to 
                provide the best possible service to our clients.
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
