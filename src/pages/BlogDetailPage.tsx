
import { useParams } from 'react-router-dom';

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">Blog Post</h1>
        <p className="text-gray-600 mb-8">
          This is the detail page for blog post ID: {id}. It will display the full 
          blog post content, author information, publication date, and related posts.
        </p>
      </div>
    </div>
  );
};

export default BlogDetailPage;
