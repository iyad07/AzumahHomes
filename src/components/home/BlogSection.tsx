
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  author: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "How to Buy a House with Low Income",
    excerpt: "Discover the strategies and programs available to help low-income families achieve homeownership.",
    date: "June 12, 2023",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80",
    author: "Sarah Johnson",
  },
  {
    id: 2,
    title: "10 Things to Consider Before Selling Your Home",
    excerpt: "Planning to sell your home? Here are important factors to consider before putting it on the market.",
    date: "May 28, 2023",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1296&q=80",
    author: "Michael Brown",
  },
  {
    id: 3,
    title: "The Rise of Smart Homes: Technology Trends",
    excerpt: "Explore the latest smart home technologies that are transforming the way we live and interact with our homes.",
    date: "May 15, 2023",
    image: "https://images.unsplash.com/photo-1558002038-2f917b3a4201?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1041&q=80",
    author: "Emily Davis",
  },
];

const BlogSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Latest Blog Posts</h2>
          <p className="section-subtitle mx-auto">
            Stay updated with the latest news and insights from the real estate world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="blog-card">
              <div className="overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="blog-image hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="blog-content">
                <div className="flex items-center blog-date">
                  <Calendar size={16} className="mr-2" />
                  {post.date}
                </div>
                <Link to={`/blog/${post.id}`}>
                  <h3 className="blog-title hover:text-real-blue transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="blog-excerpt">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.id}`} className="blog-link">
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" asChild>
            <Link to="/blog">
              View All Posts
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
