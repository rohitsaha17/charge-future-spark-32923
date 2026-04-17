import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Edit, Upload, X } from 'lucide-react';
import { z } from 'zod';
import { uploadImage } from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  excerpt: z.string().min(1, 'Excerpt is required').max(500),
  content: z.string().min(1, 'Content is required'),
  meta_description: z.string().max(160).optional(),
  featured_image: z.string().url('Featured image must be a valid URL').optional().or(z.literal('')),
});

const csvToArray = (val: string): string[] =>
  val.split(',').map((t) => t.trim()).filter(Boolean);

const AdminBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    meta_description: '',
    featured_image: '',
    tags: '',
    meta_keywords: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    checkAuthAndFetchBlogs();
  }, []);

  const checkAuthAndFetchBlogs = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error('You do not have admin access');
      navigate('/');
      return;
    }

    fetchBlogs();
  };

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load blog posts');
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingId ? formData.slug : generateSlug(title),
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'blog');
      setFormData((prev) => ({ ...prev, featured_image: url }));
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. You can paste an image URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = blogSchema.parse(formData);
      const { data: { session } } = await supabase.auth.getSession();

      const blogData: Database['public']['Tables']['blog_posts']['Insert'] = {
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        meta_description: validatedData.meta_description,
        featured_image: validatedData.featured_image || null,
        tags: formData.tags ? csvToArray(formData.tags) : null,
        meta_keywords: formData.meta_keywords ? csvToArray(formData.meta_keywords) : null,
        status: formData.status,
        author_id: session?.user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingId));
      } else {
        ({ error } = await supabase
          .from('blog_posts')
          .insert([blogData]));
      }

      if (error) throw error;

      toast.success(editingId ? 'Blog updated successfully!' : 'Blog created successfully!');
      resetForm();
      fetchBlogs();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error.code === '23505') {
        toast.error('A blog with this slug already exists');
      } else {
        toast.error(error.message || 'Failed to save blog post');
      }
    }
  };

  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      meta_description: blog.meta_description || '',
      featured_image: blog.featured_image || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      meta_keywords: Array.isArray(blog.meta_keywords) ? blog.meta_keywords.join(', ') : '',
      status: blog.status,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      meta_description: '',
      featured_image: '',
      tags: '',
      meta_keywords: '',
      status: 'draft',
    });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', pendingDeleteId);

    if (error) {
      toast.error('Failed to delete blog post');
    } else {
      toast.success('Blog post deleted successfully');
      fetchBlogs();
    }
    setPendingDeleteId(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
          Manage Blog Posts
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image</Label>
                  {formData.featured_image && (
                    <div className="relative inline-block">
                      <img
                        src={formData.featured_image}
                        alt="Featured"
                        className="h-32 rounded-md border object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFormData({ ...formData, featured_image: '' })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="featured_image"
                      placeholder="https://... or upload below"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('featured_image_file')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <input
                      id="featured_image_file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content (Rich Text)</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    meta={{
                      title: formData.title,
                      excerpt: formData.excerpt,
                      featured_image: formData.featured_image || null,
                      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="ev, charging, sustainability"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords (comma-separated)</Label>
                  <Input
                    id="meta_keywords"
                    placeholder="ev charger, fast charging, india"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Update Blog Post' : 'Create Blog Post'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Blog Posts ({blogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {blogs.map((blog) => (
                  <div key={blog.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-start gap-3">
                      {blog.featured_image && (
                        <img
                          src={blog.featured_image}
                          alt=""
                          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{blog.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: <span className={blog.status === 'published' ? 'text-green-600' : 'text-yellow-600'}>
                            {blog.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(blog)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setPendingDeleteId(blog.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlogs;
