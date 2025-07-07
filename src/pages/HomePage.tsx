import SEO from "@/components/SEO";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import AboutSection from "@/components/home/AboutSection";
import StatsSection from "@/components/home/StatsSection";
import LocationsSection from "@/components/home/LocationsSection";
import AgentsSection from "@/components/home/AgentsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";
import NewsletterSection from "@/components/home/NewsletterSection";

const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Azumah Homes",
    "description": "Premier real estate solutions in Ghana",
    "url": "https://azumahhomes.vercel.app",
    "logo": "https://azumahhomes.vercel.app/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Ghana"
    }
  };

  return (
    <div>
      <SEO 
        title="Azumah Homes - Premier Real Estate Solutions | Buy, Sell & Rent Properties in Ghana"
        description="Find your dream home with Azumah Homes - Ghana's leading real estate platform. Browse luxury properties, connect with expert agents, and discover the best property deals in Accra, Kumasi and beyond."
        keywords="real estate Ghana, properties for sale, houses for rent, Azumah Homes, Accra properties, Kumasi real estate, luxury homes Ghana, property investment"
        structuredData={structuredData}
      />
      <HeroSection />
      <CategorySection />
      <FeaturedProperties />
      <StatsSection />
      <LocationsSection />
      <AboutSection/>
      <BlogSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
