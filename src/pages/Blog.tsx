import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import GradientDivider from "@/components/GradientDivider";
import StorytellingSection from "@/components/StorytellingSection";
import brahmaputraSunset from "@/assets/brahmaputra-sunset.jpg";

const Blog = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (!error && data) {
      setBlogs(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Enhanced Hero Section */}
      <section className="relative py-32 md:py-40 mb-12 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-cyan-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <FileText className="w-4 h-4 text-cyan-300" />
            <span className="text-sm font-semibold text-white/90">Latest Updates</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
            Insights & <span className="text-cyan-300">Stories</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Stay updated with the latest news, insights, and stories from the world of electric vehicle charging
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {blogs.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
              <p className="text-muted-foreground">Blog posts are coming soon! Check back later for insights on EV charging.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 overflow-hidden">
                  {blog.featured_image && (
                    <div className="relative overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{blog.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{blog.excerpt}</p>
                    <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <GradientDivider />

        <StorytellingSection 
          title="Stories That Power Change"
          description="Every article we share is part of our mission to educate, inspire, and accelerate the adoption of electric mobility across Northeast India."
          backgroundImage={brahmaputraSunset}
        />
      </div>
    </div>
  );
};

export default Blog;
