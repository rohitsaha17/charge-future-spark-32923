import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from "@/components/SEOHead";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!error && data) {
      setBlog(data);
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

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <article className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <SEOHead
          title={blog.title}
          description={blog.meta_description || blog.excerpt}
          path={`/blog/${blog.slug}`}
          ogType="article"
          ogImage={blog.featured_image || undefined}
          keywords={blog.meta_keywords?.join(", ") || undefined}
          article={{
            publishedTime: blog.published_at,
            modifiedTime: blog.updated_at,
            tags: blog.tags || undefined,
          }}
        />
        
        {/* Hero */}
        {blog.featured_image && (
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
              <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {blog.title}
                </h1>
                <div className="flex items-center gap-4 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blog.published_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>

          {!blog.featured_image && (
            <header className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.published_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}</span>
              </div>
            </header>
          )}

          {/* Rich HTML Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-strong:text-foreground
              prose-a:text-primary prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
              prose-ul:space-y-2 prose-ol:space-y-2
              prose-li:text-muted-foreground
              prose-hr:my-10 prose-hr:border-border"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 p-6 bg-muted/30 rounded-xl flex items-center justify-between">
            <p className="font-semibold text-foreground">Found this helpful? Share it!</p>
            <Button
              variant="outline"
              onClick={() => {
                navigator.share?.({ title: blog.title, url: window.location.href }) ||
                navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
              }}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
};

export default BlogPost;
