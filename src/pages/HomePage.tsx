import SEO from "@/components/SEO";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import AboutSection from "@/components/home/AboutSection";
import StatsSection from "@/components/home/StatsSection";
import LocationsSection from "@/components/home/LocationsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";
import NewsletterSection from "@/components/home/NewsletterSection";

const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Azumah Homes",
    "description": "Real estate startup dedicated to making homeownership more flexible, transparent, and accessible for all Ghanaians through innovative rent-to-own solutions",
    "url": "https://azumahhomes.vercel.app",
    "logo": "https://azumahhomes.vercel.app/logo.png",
    "telephone": "+233551319363",
    "email": "azumahhomes@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Ghana",
      "addressRegion": "Greater Accra"
    }
  };

  return (
    <div>
      <SEO 
        title="Azumah Homes - Premier Real Estate Solutions | Buy, Sell & Rent Properties in Ghana"
        description="Find your dream home with Azumah Homes - Ghana's leading real estate platform. Browse luxury properties with our flexible rent-to-own solutions and discover the best property deals in Accra, Kumasi and beyond."
        keywords="real estate Ghana, properties for sale, houses for rent, Azumah Homes, Accra properties, Kumasi real estate, luxury homes Ghana, property investment"
        structuredData={structuredData}
      />
      <HeroSection />
      <CategorySection />
      <FeaturedProperties />
      {/* <StatsSection /> */}
      <LocationsSection />
      <AboutSection/>
      <BlogSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
