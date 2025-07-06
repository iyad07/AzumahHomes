
import { useState } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  position: string;
  image: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Robert Wilson",
    position: "Home Buyer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    content: "Working with Azumah Homes was an absolute pleasure. Their team made finding my dream home a seamless experience. The attention to detail and personalized service exceeded my expectations.",
    rating: 5,
  },
  {
    id: 2,
    name: "Jessica Martinez",
    position: "Property Seller",
    image: "https://images.unsplash.com/photo-1614644147724-2d4785d69962?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
    content: "The team at Azumah Homes helped me sell my property quickly and at a great price. Their market knowledge and negotiation skills are top-notch. I highly recommend their services.",
    rating: 5,
  },
  {
    id: 3,
    name: "David Thompson",
    position: "Apartment Renter",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    content: "Finding a rental apartment in the city was made easy with Azumah Homes. They understood my requirements and showed me options that perfectly matched my needs and budget.",
    rating: 4,
  },
  {
    id: 4,
    name: "Amanda Lee",
    position: "First-time Buyer",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    content: "As a first-time homebuyer, I had countless questions. The Azumah Homes team was patient, informative, and guided me through every step of the process. I couldn't be happier with my new home.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= testimonials.length 
        ? 0 
        : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - itemsPerPage < 0 
        ? testimonials.length - (testimonials.length % itemsPerPage || itemsPerPage) 
        : prevIndex - itemsPerPage
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">
              Read testimonials from our satisfied clients
            </p>
          </div>

          <div className="flex gap-2 mt-6 md:mt-0">
            <button 
              onClick={prevSlide}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonials"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Next testimonials"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="testimonial-image"
                />
                <div>
                  <h3 className="testimonial-author">{testimonial.name}</h3>
                  <p className="testimonial-position">{testimonial.position}</p>
                </div>
              </div>
              
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < testimonial.rating ? "fill-yellow-400" : ""} 
                  />
                ))}
              </div>
              
              <p className="testimonial-content">{testimonial.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerPage)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  currentIndex === index * itemsPerPage
                    ? "bg-real-blue"
                    : "bg-gray-300"
                )}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
