
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

const BlogPage = () => {
  const [posts] = useState([
    {
      id: 1,
      title: '10 Tips for First-Time Home Buyers in 2024',
      excerpt: 'Navigating the real estate market can be challenging for first-time buyers. Here are essential tips to help you make informed decisions...',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'Buying Guide',
      author: {
        name: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
      }
    },
    {
      id: 2,
      title: 'The Impact of AI on Real Estate Market Analysis',
      excerpt: 'Artificial Intelligence is revolutionizing how we analyze real estate markets. Discover how AI tools are helping investors make better decisions...',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80',
      date: '2024-01-10',
      readTime: '7 min read',
      category: 'Market Trends',
      author: {
        name: 'Michael Chen',
        image: 'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
      }
    },
    {
      id: 3,
      title: 'Sustainable Home Features That Increase Property Value',
      excerpt: "Green living isn't just good for the environment—it's good for your property value too. Learn about the most impactful sustainable home features...",
      image: 'https://images.unsplash.com/photo-1630619747797-4a175c6b205f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'Home Improvement',
      author: {
        name: 'Emily Rodriguez',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
      }
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Real Estate Insights & News</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest real estate trends, market insights, and expert advice
            from our experienced team of real estate professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white py-1 px-3 rounded-full text-sm">
                  {post.category}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={post.author.image} 
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium">{post.author.name}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar size={14} className="mr-1" />
                      <span className="mr-3">{formatDate(post.date)}</span>
                      <Clock size={14} className="mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                <Link 
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  Read More
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
