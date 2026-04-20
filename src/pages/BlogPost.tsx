import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEOHead from "@/components/SEOHead";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Share2,
  Clock,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Sparkles,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { motion, useScroll, useTransform } from 'framer-motion';
import { sanitizeBlogHtml } from '@/lib/sanitize';

const estimateReadingTime = (html: string): number => {
  const text = (html || '').replace(/<[^>]+>/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 220));
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], ['0%', '20%']);

  useEffect(() => {
    if (slug) fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!error && data) {
      setBlog(data);
      // Related posts
      const { data: rel } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, featured_image, published_at, tags')
        .eq('status', 'published')
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(3);
      setRelated(rel || []);
    }
    setLoading(false);
  };

  // Attach click-to-zoom on inline images in the article
  useEffect(() => {
    if (!blog) return;
    const imgs = document.querySelectorAll('.blog-article img');
    const handlers: { el: Element; fn: (e: Event) => void }[] = [];
    imgs.forEach((img) => {
      const el = img as HTMLImageElement;
      el.style.cursor = 'zoom-in';
      const fn = () => setLightbox(el.src);
      el.addEventListener('click', fn);
      handlers.push({ el, fn });
    });
    return () => handlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
  }, [blog]);

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'copy' | 'native') => {
    const url = window.location.href;
    const title = blog?.title || '';
    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        return;
      }
      const shareUrl =
        platform === 'twitter'
          ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
          : platform === 'facebook'
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
          : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    } catch (err: any) {
      if (err?.name !== 'AbortError') toast.error('Unable to share');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading story…</p>
        </div>
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

  const readingTime = estimateReadingTime(blog.content);
  const publishedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <>
      <Navigation />

      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 origin-left z-[60]"
        style={{ scaleX: progressScaleX }}
      />

      <article className="blog-article min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 relative overflow-hidden">
        <SEOHead
          title={blog.title}
          description={blog.meta_description || blog.excerpt}
          path={`/blog/${blog.slug}`}
          ogType="article"
          ogImage={blog.featured_image || undefined}
          keywords={blog.meta_keywords?.join(', ') || undefined}
          article={{
            publishedTime: blog.published_at,
            modifiedTime: blog.updated_at,
            tags: blog.tags || undefined,
          }}
          // Article JSON-LD makes the post eligible for Google's article
          // rich result (big image + date). Without it, a blog post gets
          // treated as a generic WebPage and misses those cards entirely.
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            description: blog.meta_description || blog.excerpt,
            image: blog.featured_image
              ? [blog.featured_image]
              : ["https://apluscharge.in/og-image.png"],
            datePublished: blog.published_at,
            dateModified: blog.updated_at || blog.published_at,
            keywords: blog.tags?.join(", ") || undefined,
            author: {
              "@type": "Organization",
              name: "A Plus Charge",
              url: "https://apluscharge.in",
            },
            publisher: {
              "@type": "Organization",
              name: "A Plus Charge",
              url: "https://apluscharge.in",
              logo: {
                "@type": "ImageObject",
                url: "https://apluscharge.in/og-image.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://apluscharge.in/blog/${blog.slug}`,
            },
          }}
        />

        {/* Decorative background orbs */}
        <div className="pointer-events-none absolute top-40 -left-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-[600px] -right-24 w-96 h-96 rounded-full bg-green-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-40 left-1/4 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />

        {/* Hero */}
        {blog.featured_image ? (
          <div className="relative w-full h-[480px] md:h-[600px] overflow-hidden">
            <motion.img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
              style={{ y: heroY }}
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
              <div className="container mx-auto max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-2 mb-4 text-white/80 text-sm"
                >
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider text-xs font-semibold">Insights</span>
                  </span>
                  {blog.tags?.[0] && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium border border-white/10">
                      #{blog.tags[0]}
                    </span>
                  )}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-3xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl leading-tight"
                >
                  {blog.title}
                </motion.h1>
                {blog.excerpt && (
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-base md:text-xl text-white/90 max-w-3xl mb-5"
                  >
                    {blog.excerpt}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4 text-white/80 text-sm"
                >
                  {publishedDate && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {publishedDate}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {readingTime} min read
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 pt-28 max-w-4xl">
            <div className="mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-wider font-semibold mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Insights
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent leading-tight"
              >
                {blog.title}
              </motion.h1>
              {blog.excerpt && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
                >
                  {blog.excerpt}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-4 text-muted-foreground text-sm"
              >
                {publishedDate && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {publishedDate}
                  </span>
                )}
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </span>
              </motion.div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-12 max-w-5xl relative">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-8 group"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to all stories
          </Button>

          <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
            {/* Sticky sidebar: share */}
            <aside className="hidden md:block md:sticky top-28">
              <div className="flex flex-col items-center gap-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground writing-mode-vertical">
                  Share
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]"
                    onClick={() => handleShare('twitter')}
                    aria-label="Share on X/Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
                    onClick={() => handleShare('facebook')}
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]"
                    onClick={() => handleShare('linkedin')}
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-10 h-10 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleShare('copy')}
                    aria-label="Copy link"
                  >
                    <Link2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="blog-content prose prose-lg lg:prose-xl max-w-none
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:relative
                  prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary/90
                  prose-p:text-foreground/85 prose-p:leading-[1.8] prose-p:mb-6
                  prose-p:first-of-type:first-letter:text-6xl prose-p:first-of-type:first-letter:font-bold prose-p:first-of-type:first-letter:mr-2 prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:leading-none prose-p:first-of-type:first-letter:text-primary
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
                  prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-10 prose-img:ring-1 prose-img:ring-border/50
                  prose-figure:my-10
                  prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-3 prose-figcaption:italic
                  prose-blockquote:border-l-0 prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/5 prose-blockquote:to-transparent prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:rounded-lg prose-blockquote:not-italic prose-blockquote:text-lg prose-blockquote:text-foreground prose-blockquote:font-medium prose-blockquote:relative
                  prose-ul:space-y-2 prose-ol:space-y-2
                  prose-li:text-foreground/85 prose-li:leading-relaxed
                  prose-hr:my-12 prose-hr:border-border/40
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-foreground prose-pre:text-background prose-pre:rounded-xl prose-pre:shadow-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.content) }}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-14 pt-8 border-t border-border"
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-4 py-1.5 bg-gradient-to-r from-primary/10 to-cyan-500/10 text-primary rounded-full text-sm font-medium border border-primary/20 hover:from-primary/20 hover:to-cyan-500/20 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Mobile share row */}
              <div className="md:hidden mt-10 p-6 bg-white/60 backdrop-blur rounded-2xl border border-border/50">
                <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share this story
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-1" onClick={() => handleShare('twitter')}>
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1" onClick={() => handleShare('facebook')}>
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1" onClick={() => handleShare('linkedin')}>
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1" onClick={() => handleShare('copy')}>
                    <Link2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop share CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="hidden md:flex mt-12 p-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 rounded-2xl items-center justify-between gap-6 border border-border/50 shadow-sm"
              >
                <div>
                  <p className="font-bold text-xl text-foreground mb-1">Enjoyed this story?</p>
                  <p className="text-sm text-muted-foreground">Share it with someone who'd love it too.</p>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:shadow-lg"
                  onClick={() => handleShare(navigator.share ? 'native' : 'copy')}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 pt-12 border-t border-border"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                Keep reading
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((post) => (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block bg-white/80 backdrop-blur rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    {post.featured_image && (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {post.published_at &&
                          new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Gallery grid styling for custom gallery blocks + lightbox */}
        <style>{`
          .blog-article .blog-gallery {
            display: grid;
            gap: 0.75rem;
            margin: 2.5rem 0;
          }
          .blog-article .blog-gallery.cols-2 { grid-template-columns: 1fr 1fr; }
          .blog-article .blog-gallery.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
          @media (max-width: 640px) {
            .blog-article .blog-gallery.cols-3 { grid-template-columns: 1fr 1fr; }
          }
          .blog-article .blog-gallery img {
            margin: 0 !important;
            width: 100%;
            aspect-ratio: 1 / 1;
            object-fit: cover;
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .blog-article figure {
            margin: 2rem 0;
          }
          .blog-article figure img {
            margin: 0 !important;
          }
          .blog-article .prose h2::before {
            content: "";
            display: block;
            width: 2.5rem;
            height: 3px;
            background: linear-gradient(90deg, hsl(var(--primary)), #00C6FF);
            border-radius: 2px;
            margin-bottom: 0.75rem;
          }
        `}</style>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
            onClick={() => setLightbox(null)}
          >
            <img
              src={lightbox}
              alt={`${blog.title} – enlarged view`}
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
      </article>
      <Footer />
    </>
  );
};

export default BlogPost;
